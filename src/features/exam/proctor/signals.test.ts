import { describe, expect, it } from 'vitest';
import {
  faceReading,
  headAngles,
  levelDb,
  meanBrightness,
  mergeObjectSignals,
  objectSignals,
} from './signals';

/** Column-major 4×4 rotation matrix about the vertical axis (yaw) or the side axis (pitch). */
function rotation(axis: 'yaw' | 'pitch', degrees: number): number[] {
  const r = (degrees * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  // Row-major rows, then transposed into column-major data.
  const rows =
    axis === 'yaw'
      ? [
          [c, 0, s, 0],
          [0, 1, 0, 0],
          [-s, 0, c, 0],
          [0, 0, 0, 1],
        ]
      : [
          [1, 0, 0, 0],
          [0, c, -s, 0],
          [0, s, c, 0],
          [0, 0, 0, 1],
        ];
  const data: number[] = [];
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++) data.push(rows[row]?.[col] ?? 0);
  return data;
}

describe('MediaPipe result conversion', () => {
  it('AC-7.2 reads head yaw and pitch in degrees from the transformation matrix', () => {
    const yaw = headAngles({ data: rotation('yaw', 30) });
    expect(Math.abs(yaw.yaw)).toBeCloseTo(30, 5);
    expect(yaw.pitch).toBeCloseTo(0, 5);
    const pitch = headAngles({ data: rotation('pitch', -20) });
    expect(Math.abs(pitch.pitch)).toBeCloseTo(20, 5);
    expect(pitch.yaw).toBeCloseTo(0, 5);
  });

  it('AC-7.2 combines both eyes for gaze, blink and mouth', () => {
    const reading = faceReading(
      [
        { categoryName: 'eyeLookOutLeft', score: 0.8 },
        { categoryName: 'eyeLookInRight', score: 0.6 },
        { categoryName: 'eyeLookDownLeft', score: 0.4 },
        { categoryName: 'eyeLookDownRight', score: 0.2 },
        { categoryName: 'eyeBlinkLeft', score: 1 },
        { categoryName: 'eyeBlinkRight', score: 0.5 },
        { categoryName: 'jawOpen', score: 0.3 },
      ],
      undefined,
    );
    expect(reading).toMatchObject({ yaw: 0, pitch: 0, jawOpen: 0.3, gazeUp: 0 });
    expect(reading.gazeSide).toBeCloseTo(0.7);
    expect(reading.gazeDown).toBeCloseTo(0.3);
    expect(reading.blink).toBeCloseTo(0.75);
  });

  const det = (categoryName: string, score: number) => ({
    categories: [{ categoryName, score }],
  });

  it('AC-7.2 counts phones at lower confidence than people and items', () => {
    expect(
      objectSignals([
        det('person', 0.9),
        det('person', 0.4),
        det('cell phone', 0.26),
        det('book', 0.6),
        det('tv', 0.45),
        { categories: [] },
      ]),
    ).toEqual({ phone: true, persons: 1, items: 1, bodyVisible: true });
    expect(objectSignals([det('cell phone', 0.24)])).toEqual({
      phone: false,
      persons: 0,
      items: 0,
      bodyVisible: false,
    });
  });

  it('AC-7.2 counts a remote as a phone, and a faint person as a body in view', () => {
    expect(objectSignals([det('remote', 0.3)]).phone).toBe(true);
    expect(objectSignals([det('person', 0.35)])).toEqual({
      phone: false,
      persons: 0,
      items: 0,
      bodyVisible: true,
    });
    expect(objectSignals([det('person', 0.25)]).bodyVisible).toBe(false);
  });

  it('AC-7.2 takes a phone or body from the zoomed-out copy, but counts people once', () => {
    const full = { phone: false, persons: 1, items: 1, bodyVisible: false };
    const zoomed = { phone: true, persons: 3, items: 0, bodyVisible: true };
    expect(mergeObjectSignals(full, zoomed)).toEqual({
      phone: true,
      persons: 1,
      items: 1,
      bodyVisible: true,
    });
  });

  it('measures brightness and loudness', () => {
    expect(meanBrightness([255, 255, 255, 255, 0, 0, 0, 255])).toBe(127.5);
    expect(meanBrightness([])).toBe(0);
    expect(levelDb([1, -1, 1, -1])).toBeCloseTo(0);
    expect(levelDb([0.01, -0.01])).toBeCloseTo(-40);
    expect(levelDb([0, 0])).toBe(-100);
  });
});
