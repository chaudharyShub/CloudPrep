import { describe, expect, it } from 'vitest';
import type { IntegrityEvent, IntegrityEventType, IntegrityLog } from './integrity';
import {
  calibrate,
  checkInIssues,
  CLEAR_MS,
  createProctorTracker,
  DEFAULT_CALIBRATION,
  MAX_STRIKES,
  proctorStatus,
  stepProctor,
  STRIKE_MERGE_MS,
  type FaceReading,
  type FrameSignals,
  type ProctorInput,
  type ProctorTrackerState,
  type TrackedCondition,
} from './proctor';

const NEUTRAL: FaceReading = {
  yaw: 0,
  pitch: 0,
  gazeSide: 0.1,
  gazeUp: 0.05,
  gazeDown: 0.2,
  blink: 0.1,
  jawOpen: 0.02,
};
const frame = (
  patch: Partial<FrameSignals> = {},
  face: Partial<FaceReading> = {},
): FrameSignals => ({
  faces: 1,
  face: { ...NEUTRAL, ...face },
  brightness: 120,
  ...patch,
});

/** Feeds inputs every `stepMs` from t=0 and collects the events with their times. */
function run(
  inputs: (at: number) => ProctorInput | null,
  durationMs: number,
  stepMs = 250,
  start: ProctorTrackerState = createProctorTracker(calibrate([NEUTRAL], [-60])),
) {
  let state = start;
  const events: { type: TrackedCondition; at: number }[] = [];
  for (let at = 0; at <= durationMs; at += stepMs) {
    const input = inputs(at);
    if (!input) continue;
    const result = stepProctor(state, input);
    state = result.state;
    events.push(...result.events.map((type) => ({ type, at })));
  }
  return { events, state };
}

const frames = (signals: (at: number) => FrameSignals) => (at: number) =>
  ({ kind: 'frame', at, signals: signals(at) }) as const;

describe('proctor detection rules', () => {
  it('AC-7.2 reports nothing while the candidate sits still and looks at the screen', () => {
    expect(
      run(
        frames(() => frame()),
        10_000,
      ).events,
    ).toEqual([]);
  });

  it('AC-7.2 counts a missing face only after 2 seconds, and only once per episode', () => {
    const { events } = run(
      frames((at) => (at < 1500 ? frame({ faces: 0, face: null }) : frame())),
      3000,
    );
    expect(events).toEqual([]); // a 1.5-second dip doesn't count

    const long = run(
      frames(() => frame({ faces: 0, face: null })),
      10_000,
    );
    expect(long.events).toEqual([{ type: 'face-not-detected', at: 2000 }]);
  });

  it('AC-7.2 counts the same condition again only after it has cleared', () => {
    const away = (at: number) =>
      frame({}, { yaw: at < 3000 || (at >= 3000 + CLEAR_MS + 500 && at < 8000) ? 40 : 0 });
    const { events } = run(frames(away), 9000);
    expect(events.map((e) => e.type)).toEqual(['looking-away', 'looking-away']);
  });

  it('AC-7.2 detects head turns, eyes off the screen and closed eyes relative to calibration', () => {
    expect(
      run(
        frames(() => frame({}, { pitch: 25 })),
        3000,
      ).events[0]?.type,
    ).toBe('looking-away');
    expect(
      run(
        frames(() => frame({}, { gazeSide: 0.6 })),
        3000,
      ).events[0]?.type,
    ).toBe('eyes-off-screen');
    expect(
      run(
        frames(() => frame({}, { gazeDown: 0.7 })),
        3000,
      ).events[0]?.type,
    ).toBe('eyes-off-screen');
    const closed = run(
      frames(() => frame({}, { blink: 0.9 })),
      4000,
    ).events;
    expect(closed).toEqual([{ type: 'eyes-closed', at: 3000 }]);
    // A blink is far shorter than 3 seconds.
    const blink = run(
      frames((at) => frame({}, { blink: at % 2000 < 250 ? 0.9 : 0.1 })),
      8000,
    );
    expect(blink.events).toEqual([]);
  });

  it('AC-7.2 uses the calibrated pose, so a camera placed to one side is not "looking away"', () => {
    const sideways = { ...NEUTRAL, yaw: 30, pitch: -15 };
    const start = createProctorTracker(calibrate([sideways], [-60]));
    expect(
      run(
        frames(() => frame({}, sideways)),
        5000,
        250,
        start,
      ).events,
    ).toEqual([]);
  });

  it('AC-7.2 detects lips moving (talking, whispering, chewing)', () => {
    const talking = frames((at) => frame({}, { jawOpen: Math.floor(at / 250) % 2 ? 0.3 : 0.02 }));
    expect(run(talking, 3000).events.map((e) => e.type)).toEqual(['mouth-moving']);
  });

  it('AC-7.2 detects a covered camera and more than one face', () => {
    expect(
      run(
        frames(() => frame({ brightness: 5, faces: 0, face: null })),
        3000,
      ).events,
    ).toEqual([{ type: 'camera-covered', at: 1500 }]);
    expect(
      run(
        frames(() => frame({ faces: 2 })),
        2000,
      ).events,
    ).toEqual([{ type: 'multiple-faces', at: 1000 }]);
  });

  it('AC-7.2 detects voices above the room noise measured at check-in', () => {
    const quiet = (at: number) => ({ kind: 'audio', at, db: -58 }) as const;
    expect(run(quiet, 5000, 100).events).toEqual([]);
    const speech = (at: number) => ({ kind: 'audio', at, db: at > 1000 ? -30 : -58 }) as const;
    expect(run(speech, 5000, 100).events.map((e) => e.type)).toEqual(['voice-detected']);
    // A single click or knock isn't speech.
    const knock = (at: number) => ({ kind: 'audio', at, db: at === 2000 ? -10 : -58 }) as const;
    expect(run(knock, 5000, 100).events).toEqual([]);
  });

  it('AC-7.2 needs an object in 2 of the last 3 object checks', () => {
    const objects = (pattern: boolean[], key: 'phone' | 'persons' | 'items') => (at: number) => {
      const hit = pattern[at / 1000] ?? false;
      return {
        kind: 'objects',
        at,
        signals: {
          phone: key === 'phone' && hit,
          persons: key === 'persons' && hit ? 2 : 1,
          items: key === 'items' && hit ? 1 : 0,
        },
      } as const;
    };
    expect(run(objects([true, false, false, true], 'phone'), 3000, 1000).events).toEqual([]);
    expect(run(objects([true, true], 'phone'), 3000, 1000).events).toEqual([
      { type: 'phone-detected', at: 1000 },
    ]);
    expect(run(objects([false, true, true], 'persons'), 3000, 1000).events[0]?.type).toBe(
      'person-detected',
    );
    expect(run(objects([true, true], 'items'), 3000, 1000).events[0]?.type).toBe('item-detected');
  });
});

const log = (types: [IntegrityEventType, number][]): IntegrityLog => ({
  mode: 'proctored',
  events: types.map(([type, at]): IntegrityEvent => ({ type, at })),
});

describe('proctor verdict', () => {
  it('AC-7.4 gives warnings, then ends the exam on the third strike', () => {
    const status = proctorStatus(
      log([
        ['proctor-started', 0],
        ['looking-away', 10_000],
        ['window-blur', 20_000],
        ['mouth-moving', 30_000],
      ]),
    );
    expect(MAX_STRIKES).toBe(3);
    expect(status.roles).toEqual(['info', 'warning', 'final-warning', 'ended']);
    expect(status.strikeCount).toBe(3);
    expect(status.endedBy?.type).toBe('mouth-moving');
  });

  it('AC-7.4 counts events close together as one incident (Alt+Tab hides the tab and blurs the window)', () => {
    const status = proctorStatus(
      log([
        ['window-blur', 1000],
        ['tab-hidden', 1000 + STRIKE_MERGE_MS - 1],
        ['tab-visible', 9000],
      ]),
    );
    expect(status.strikeCount).toBe(1);
    expect(status.roles).toEqual(['warning', 'merged', 'info']);
    expect(status.endedBy).toBeNull();
  });

  it('AC-7.4 ends the exam at once for a phone, another person, a second display or a lost device', () => {
    for (const type of [
      'phone-detected',
      'person-detected',
      'multiple-faces',
      'extra-display',
      'camera-lost',
      'microphone-lost',
    ] as const) {
      const status = proctorStatus(
        log([
          ['proctor-started', 0],
          [type, 5000],
        ]),
      );
      expect(status.endedBy?.type, type).toBe(type);
      expect(status.strikeCount).toBe(0);
    }
  });

  it('AC-7.4 ignores events after the exam ended and never judges strict practice', () => {
    const ended = proctorStatus(
      log([
        ['phone-detected', 1],
        ['looking-away', 9000],
      ]),
    );
    expect(ended.roles).toEqual(['ended', 'info']);
    const strict = proctorStatus({ mode: 'focus', events: [{ type: 'phone-detected', at: 1 }] });
    expect(strict.endedBy).toBeNull();
    expect(strict.roles).toEqual(['info']);
  });

  it('AC-7.5 counts a reload as a strike', () => {
    expect(proctorStatus(log([['proctor-resumed', 1]])).strikeCount).toBe(1);
  });
});

describe('check-in', () => {
  it('AC-7.1 calibrates from median readings, ignoring a cough', () => {
    const cal = calibrate(
      [NEUTRAL, { ...NEUTRAL, yaw: 4 }, { ...NEUTRAL, yaw: 2 }],
      [-60, -61, -10, -59, -60],
    );
    expect(cal.yaw).toBe(2);
    expect(cal.noiseDb).toBe(-60);
    expect(calibrate([], [])).toEqual(DEFAULT_CALIBRATION);
  });

  it('AC-7.1 lists what blocks the room check', () => {
    const objects = { phone: false, persons: 1, items: 0 };
    expect(checkInIssues({ frame: frame(), objects, noiseDb: -60 })).toEqual([]);
    expect(checkInIssues({ frame: null, objects: null, noiseDb: null })).toEqual(['dark']);
    expect(
      checkInIssues({
        frame: frame({ faces: 0, face: null }),
        objects: { phone: true, persons: 2, items: 1 },
        noiseDb: -20,
      }),
    ).toEqual(['no-face', 'phone', 'person', 'item', 'noisy']);
    expect(checkInIssues({ frame: frame({ faces: 2 }), objects, noiseDb: -60 })).toEqual([
      'multiple-faces',
    ]);
  });
});
