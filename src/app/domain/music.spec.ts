import { describe, expect, it } from 'vitest';
import { getNotes, pitchClass, ROOTS, SCALE_OPTIONS, CHORD_OPTIONS, getChordNotes } from './music';

describe('Music theory', () => {
  it('returns the requested C major scale', () => {
    expect(getNotes('C', 'major').map((note) => note.name)).toEqual([
      'C',
      'D',
      'E',
      'F',
      'G',
      'A',
      'B',
    ]);
  });

  it.each([
    ['F', ['F', 'G', 'A', 'B♭', 'C', 'D', 'E']],
    ['D♭', ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C']],
    ['G♯', ['G♯', 'A♯', 'B♯', 'C♯', 'D♯', 'E♯', 'F♯♯']],
  ])('spells %s major correctly, including accidentals', (root, expected) => {
    expect(getNotes(root as string, 'major').map((note) => note.name)).toEqual(expected);
  });

  it('returns A natural minor', () => {
    expect(getNotes('A', 'minor').map((note) => note.name)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ]);
  });

  it('distinguishes a major scale from its major and minor triads', () => {
    expect(getNotes('C', 'major', true).map((note) => note.name)).toEqual(['C', 'E', 'G']);
    expect(getNotes('C', 'minor', true).map((note) => note.name)).toEqual(['C', 'E♭', 'G']);
    expect(getNotes('B♭', 'minor', true).map((note) => note.name)).toEqual(['B♭', 'D♭', 'F']);
  });

  it.each([
    ['maj7', ['C', 'E', 'G', 'B']],
    ['minor7', ['C', 'E♭', 'G', 'B♭']],
    ['dominant7', ['C', 'E', 'G', 'B♭']],
    ['sus2', ['C', 'D', 'G']],
    ['sus4', ['C', 'F', 'G']],
  ] as const)('constructs C %s with the correct chord tones', (key, names) => {
    expect(getChordNotes('C', key).map((note) => note.name)).toEqual(names);
  });

  it('spells all chord tones consistently for sharp and flat roots', () => {
    for (const root of ROOTS)
      for (const { key } of CHORD_OPTIONS) {
        const notes = getChordNotes(root, key);
        expect(new Set(notes.map((note) => note.pitch)).size).toBe(notes.length);
        for (const note of notes) expect(pitchClass(note.name)).toBe(note.pitch);
      }
    expect(getChordNotes('B♭', 'maj7').map((note) => note.name)).toEqual(['B♭', 'D', 'F', 'A']);
  });

  it('matches every spelled note to its pitch and interval for all roots and scales', () => {
    for (const root of ROOTS) {
      for (const { key } of SCALE_OPTIONS) {
        const notes = getNotes(root, key);
        expect(new Set(notes.map((note) => note.pitch)).size).toBe(notes.length);
        for (const note of notes) {
          expect(pitchClass(note.name)).toBe(note.pitch);
          expect(note.pitch).toBe((pitchClass(root) + note.interval) % 12);
        }
      }
    }
  });
});
