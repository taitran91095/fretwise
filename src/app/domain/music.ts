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

export const CHORDS = {
  major: {
    name: 'Major',
    intervals: [0, 4, 7],
    degrees: [0, 2, 4],
    labels: ['1', '3', '5'],
    roles: ['Root', 'Third', 'Fifth'],
    description: 'A bright triad built from the root, major third, and fifth.',
  },
  minor: {
    name: 'Minor',
    intervals: [0, 3, 7],
    degrees: [0, 2, 4],
    labels: ['1', '♭3', '5'],
    roles: ['Root', 'Third', 'Fifth'],
    description: 'A minor third gives this triad a darker sound.',
  },
  maj7: {
    name: 'Major 7 (maj7)',
    intervals: [0, 4, 7, 11],
    degrees: [0, 2, 4, 6],
    labels: ['1', '3', '5', '7'],
    roles: ['Root', 'Third', 'Fifth', 'Seventh'],
    description: 'A major triad with a major seventh. A soft, colorful sound for jazz and pop.',
  },
  minor7: {
    name: 'Minor 7 (m7)',
    intervals: [0, 3, 7, 10],
    degrees: [0, 2, 4, 6],
    labels: ['1', '♭3', '5', '♭7'],
    roles: ['Root', 'Third', 'Fifth', 'Seventh'],
    description: 'A minor triad with a minor seventh. A warm sound for soul, jazz, and pop.',
  },
  dominant7: {
    name: 'Dominant 7 (7)',
    intervals: [0, 4, 7, 10],
    degrees: [0, 2, 4, 6],
    labels: ['1', '3', '5', '♭7'],
    roles: ['Root', 'Third', 'Fifth', 'Seventh'],
    description:
      'A major triad with a minor seventh. Explore the tension heard in blues and chord resolutions.',
  },
  sus2: {
    name: 'Suspended 2 (sus2)',
    intervals: [0, 2, 7],
    degrees: [0, 1, 4],
    labels: ['1', '2', '5'],
    roles: ['Root', 'Second', 'Fifth'],
    description:
      'Replace the third with a second for an open sound that is neither major nor minor.',
  },
  sus4: {
    name: 'Suspended 4 (sus4)',
    intervals: [0, 5, 7],
    degrees: [0, 3, 4],
    labels: ['1', '4', '5'],
    roles: ['Root', 'Fourth', 'Fifth'],
    description:
      'Replace the third with a fourth. Try moving from sus4 back to major to hear it resolve.',
  },
} as const;
export type ChordKey = keyof typeof CHORDS;
export const CHORD_OPTIONS = Object.entries(CHORDS).map(([key, chord]) => ({
  key: key as ChordKey,
  name: chord.name,
}));

export function getChordNotes(root: string, key: ChordKey): Note[] {
  return spellNotes(root, CHORDS[key]);
}

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
  if (chord) return getChordNotes(root, isMinorScale(key) ? 'minor' : 'major');
  return spellNotes(root, SCALES[key]);
}

function spellNotes(
  root: string,
  pattern: {
    readonly intervals: readonly number[];
    readonly degrees: readonly number[];
    readonly labels: readonly string[];
  },
): Note[] {
  const { intervals, degrees, labels } = pattern;
  const letters = Object.keys(NATURAL);
  const rootLetterIndex = letters.indexOf(root[0]);
  const rootPitch = pitchClass(root);

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
