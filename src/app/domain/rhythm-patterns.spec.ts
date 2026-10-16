import { describe, expect, it } from 'vitest';
import {
  C_MAJOR_FRETS,
  countEighthNotes,
  countPattern,
  FINGERPICKING_PATTERNS,
  metronomeBeats,
  RHYTHM_STYLES,
  STRUMMING_PATTERNS,
} from './rhythm-patterns';

const patterns = [...STRUMMING_PATTERNS, ...FINGERPICKING_PATTERNS];

describe('Rhythm pattern library', () => {
  it.each(patterns)('$id fills exactly one bar of its written meter', (pattern) => {
    const slots = (pattern.beats * pattern.subdivision) / pattern.beatUnit;
    expect(pattern.strokes ?? pattern.picks).toHaveLength(slots);
    expect(countPattern(pattern)).toHaveLength(slots);
    expect(
      pattern.accents.every((slot) => Number.isInteger(slot) && slot >= 0 && slot < slots),
    ).toBe(true);
    expect(
      pattern.mutedSteps.every((slot) => Number.isInteger(slot) && slot >= 0 && slot < slots),
    ).toBe(true);
    if (pattern.strokes)
      expect(pattern.strokes.every((stroke) => ['D', 'U', 'B', 'X', '–'].includes(stroke))).toBe(
        true,
      );
  });

  it('offers at least three distinct variants per style on both pages, with Vietnamese references', () => {
    expect(new Set(patterns.map((pattern) => pattern.id)).size).toBe(patterns.length);
    expect(patterns.length).toBeGreaterThanOrEqual(100);
    for (const style of RHYTHM_STYLES) {
      expect(style.sources.some((source) => source.language === 'vi')).toBe(true);
      for (const source of style.sources) expect(new URL(source.url).protocol).toBe('https:');
      for (const catalog of [STRUMMING_PATTERNS, FINGERPICKING_PATTERNS]) {
        const variants = catalog.filter((pattern) => pattern.style === style.id);
        expect(variants.length).toBeGreaterThanOrEqual(3);
        const rhythms = variants.map((pattern) =>
          JSON.stringify([
            pattern.beats,
            pattern.beatUnit,
            pattern.subdivision,
            pattern.strokes ?? pattern.picks,
            pattern.mutedSteps,
            pattern.accents,
          ]),
        );
        expect(new Set(rhythms).size).toBe(variants.length);
      }
    }
  });

  it('keeps every pluck on a playable C major string, without reusing a finger in a pinch', () => {
    const fingerForString: Record<number, string> = {
      1: 'a',
      2: 'm',
      3: 'i',
      4: 'p',
      5: 'p',
      6: 'p',
    };
    for (const pattern of FINGERPICKING_PATTERNS) {
      for (const step of pattern.picks!) {
        expect(new Set(step.map((pick) => pick.string)).size).toBe(step.length);
        expect(new Set(step.map((pick) => pick.finger)).size).toBe(step.length);
        for (const pick of step) {
          expect(C_MAJOR_FRETS[pick.string - 1]).toBeGreaterThanOrEqual(0);
          expect(pick.finger).toBe(fingerForString[pick.string]);
        }
      }
      for (const index of pattern.mutedSteps) expect(pattern.picks![index]).toEqual([]);
    }
  });

  it('counts sixteenths, 6/8, and shuffle triplets without confusing their main pulses', () => {
    const funk = STRUMMING_PATTERNS.find((pattern) => pattern.id === 'funk-ghosts')!;
    expect(countPattern(funk)).toEqual([
      '1',
      'e',
      '&',
      'a',
      '2',
      'e',
      '&',
      'a',
      '3',
      'e',
      '&',
      'a',
      '4',
      'e',
      '&',
      'a',
    ]);
    const slowRock = FINGERPICKING_PATTERNS.find((pattern) => pattern.id === 'slow-rock-arch')!;
    expect(countPattern(slowRock)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(metronomeBeats(slowRock)).toBe(2);
    const slowFill = FINGERPICKING_PATTERNS.find((pattern) => pattern.id === 'slow-rock-double')!;
    expect(countPattern(slowFill)).toEqual([
      '1',
      '&',
      '2',
      '&',
      '3',
      '&',
      '4',
      '&',
      '5',
      '&',
      '6',
      '&',
    ]);
    const shuffle = STRUMMING_PATTERNS.find((pattern) => pattern.id === 'blues-shuffle')!;
    expect(countPattern(shuffle)).toEqual([
      '1',
      'la',
      'li',
      '2',
      'la',
      'li',
      '3',
      'la',
      'li',
      '4',
      'la',
      'li',
    ]);
    expect(metronomeBeats(shuffle)).toBe(4);
    expect(countEighthNotes(3)).toEqual(['1', '&', '2', '&', '3', '&']);
  });
});
