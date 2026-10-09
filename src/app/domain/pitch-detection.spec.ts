import { describe, expect, it } from 'vitest';
import { detectPitch, tuningReading } from './pitch-detection';

function waveform(frequency: number, sampleRate: number, harmonics = false): Float32Array {
  return Float32Array.from({ length: 4096 }, (_, i) => {
    const phase = (2 * Math.PI * frequency * i) / sampleRate;
    return (
      0.3 * Math.sin(phase) +
      (harmonics ? 0.2 * Math.sin(phase * 2) + 0.1 * Math.sin(phase * 3) : 0)
    );
  });
}

describe('Pitch detection', () => {
  it.each([44100, 48000])(
    'detects all six standard guitar strings at %s Hz sample rate',
    (sampleRate) => {
      for (const midi of [40, 45, 50, 55, 59, 64]) {
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        const detected = detectPitch(waveform(frequency, sampleRate), sampleRate)!;
        expect(Math.abs(1200 * Math.log2(detected / frequency))).toBeLessThan(2);
      }
    },
  );

  it('finds the fundamental when guitar-like overtones are present', () => {
    const frequency = 82.4069;
    expect(detectPitch(waveform(frequency, 48000, true), 48000)).toBeCloseTo(frequency, 1);
  });

  it('rejects silence and aperiodic noise', () => {
    expect(detectPitch(new Float32Array(4096), 48000)).toBeNull();
    let seed = 7;
    const noise = Float32Array.from({ length: 4096 }, () => {
      seed = (seed * 16807) % 2147483647;
      return (seed / 2147483647 - 0.5) * 0.3;
    });
    expect(detectPitch(noise, 48000)).toBeNull();
  });

  it('reports octaves and flat/sharp cents relative to a selected string', () => {
    expect(tuningReading(440)).toMatchObject({ note: 'A', octave: 4, cents: 0 });
    const lowE = 440 * 2 ** ((40 - 69) / 12);
    expect(tuningReading(lowE * 2 ** (12 / 1200), 40).cents).toBeCloseTo(12);
    expect(tuningReading(lowE * 2 ** (-18 / 1200), 40)).toMatchObject({ note: 'E', octave: 2 });
    expect(tuningReading(lowE * 2 ** (-18 / 1200), 40).cents).toBeCloseTo(-18);
  });
});
