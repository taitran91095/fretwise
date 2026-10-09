export const ROOTS = [
  'C',
  'C♯',
  'D♭',
  'D',
  'D♯',
  'E♭',
  'E',
  'F',
  'F♯',
  'G♭',
  'G',
  'G♯',
  'A♭',
  'A',
  'A♯',
  'B♭',
  'B',
];
export const CHROMATIC = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const NATURAL: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const SCALES = {
  major: {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: [0, 1, 2, 3, 4, 5, 6],
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    formula: 'W · W · H · W · W · W · H',
    mood: 'Bright, open, and familiar. The starting point for understanding melody and harmony.',
  },
  minor: {
    name: 'Natural minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: [0, 1, 2, 3, 4, 5, 6],
    labels: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    formula: 'W · H · W · W · H · W · W',
    mood: 'Warm and introspective. Explore the sound behind countless expressive melodies.',
  },
  majorPentatonic: {
    name: 'Major pentatonic',
    intervals: [0, 2, 4, 7, 9],
    degrees: [0, 1, 2, 4, 5],
    labels: ['1', '2', '3', '5', '6'],
    formula: 'W · W · 3H · W · 3H',
    mood: 'Five notes, endless possibilities. A bright foundation for folk, country, and melodic solos.',
  },
  minorPentatonic: {
    name: 'Minor pentatonic',
    intervals: [0, 3, 5, 7, 10],
    degrees: [0, 2, 3, 4, 6],
    labels: ['1', '♭3', '4', '5', '♭7'],
    formula: '3H · W · W · 3H · W',
    mood: 'The essential five-note sound of blues and rock. A great place to begin improvising.',
  },
} as const;
export type ScaleKey = keyof typeof SCALES;
export type ScaleDefinition = (typeof SCALES)[ScaleKey];

export interface Note {
  name: string;
  pitch: number;
  interval: number;
  degree: string;
}

export const SCALE_OPTIONS = Object.entries(SCALES).map(([key, scale]) => ({
  key: key as ScaleKey,
  name: scale.name,
}));

export function isMinorScale(key: ScaleKey): boolean {
  return key === 'minor' || key === 'minorPentatonic';
}

export function pitchClass(name: string): number {
  const accidentalOffset = [...name.slice(1)].reduce((offset, accidental) => {
    if (accidental === '♯') return offset + 1;
    if (accidental === '♭') return offset - 1;
    return offset;
  }, 0);
  return (NATURAL[name[0]] + accidentalOffset + 12) % 12;
}

export function getNotes(root: string, key: ScaleKey, chord = false): Note[] {
  const scale = SCALES[key];
  const letters = Object.keys(NATURAL);
  const rootLetterIndex = letters.indexOf(root[0]);
  const rootPitch = pitchClass(root);
  const minor = isMinorScale(key);
  const intervals = chord ? [0, minor ? 3 : 4, 7] : scale.intervals;
  const degrees = chord ? [0, 2, 4] : scale.degrees;
  const labels = chord ? ['1', minor ? '♭3' : '3', '5'] : scale.labels;

  return intervals.map((interval, index) => {
    const pitch = (rootPitch + interval) % 12;
    const letter = letters[(rootLetterIndex + degrees[index]) % letters.length];
    return {
      name: spellPitch(letter, pitch),
      pitch,
      interval,
      degree: labels[index],
    };
  });
}

/** Preserve scale-degree letters: F major needs B♭, while G♯ major needs F♯♯. */
function spellPitch(letter: string, pitch: number): string {
  let accidentalOffset = (pitch - NATURAL[letter] + 12) % 12;
  if (accidentalOffset > 6) accidentalOffset -= 12;
  const accidental = accidentalOffset >= 0 ? '♯' : '♭';
  return letter + accidental.repeat(Math.abs(accidentalOffset));
}
