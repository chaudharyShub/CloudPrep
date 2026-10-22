import { levelDb } from './signals';

/** Reads the microphone's loudness. Audio is measured in memory and never recorded. */
export interface LevelMeter {
  /** Current level in dBFS (−100 is silence, 0 is the loudest possible). */
  read: () => number;
  /** Browsers start audio suspended until a user action; call from a click. */
  resume: () => Promise<void>;
  close: () => void;
}

export function createLevelMeter(stream: MediaStream): LevelMeter {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  // Not connected to the speakers: nothing is played back.
  source.connect(analyser);
  const buffer = new Float32Array(analyser.fftSize);
  return {
    read() {
      analyser.getFloatTimeDomainData(buffer);
      return levelDb(buffer);
    },
    resume: () => context.resume(),
    close() {
      source.disconnect();
      void context.close().catch(() => undefined);
    },
  };
}
