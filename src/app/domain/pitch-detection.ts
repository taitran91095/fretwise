import { CHROMATIC } from './music';

export interface TuningReading {
  note: string;
  octave: number;
  frequency: number;
  cents: number;
}

export function tuningReading(frequency: number, targetMidi?: number): TuningReading {
  const midi = targetMidi ?? Math.round(69 + 12 * Math.log2(frequency / 440));
  const target = 440 * 2 ** ((midi - 69) / 12);
  return {
    note: CHROMATIC[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    frequency,
    cents: 1200 * Math.log2(frequency / target),
  };
}

/** YIN difference function: find the first reliable period, not a higher harmonic. */
export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  const energy = samples.reduce((sum, value) => sum + value * value, 0) / samples.length;
  if (energy < 0.000064) return null;
  const maxLag = Math.min(Math.floor(sampleRate / 60), Math.floor(samples.length / 2));
  const minLag = Math.floor(sampleRate / 1000);
  const differences = new Float32Array(maxLag + 1);
  const windowSize = samples.length - maxLag;
  let cumulative = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    let difference = 0;
    for (let index = 0; index < windowSize; index++) {
      const delta = samples[index] - samples[index + lag];
      difference += delta * delta;
    }
    cumulative += difference;
    differences[lag] = cumulative ? (difference * lag) / cumulative : 1;
  }
  for (let lag = Math.max(2, minLag); lag < maxLag - 1; lag++) {
    if (differences[lag] >= 0.15) continue;
    while (lag < maxLag - 1 && differences[lag + 1] < differences[lag]) lag++;
    const left = differences[lag - 1];
    const center = differences[lag];
    const right = differences[lag + 1];
    const denominator = left - 2 * center + right;
    const offset = denominator ? (left - right) / (2 * denominator) : 0;
    return sampleRate / (lag + offset);
  }
  return null;
}
