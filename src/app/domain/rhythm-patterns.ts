import { RhythmPattern } from './rhythm-types';
export type {
  Pick,
  PickingFinger,
  RhythmKind,
  RhythmPattern,
  RhythmStyleId,
  Stroke,
} from './rhythm-types';
export { STRUMMING_PATTERNS } from './strumming-patterns';
export { FINGERPICKING_PATTERNS } from './fingerpicking-patterns';
export { RHYTHM_STYLES, getRhythmStyle } from './rhythm-styles';

export const C_MAJOR_FRETS = [0, 1, 0, 2, 3, -1] as const;
export const TAB_STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'] as const;

export function countEighthNotes(beats: number): string[] {
  return Array.from({ length: beats * 2 }, (_, index) =>
    index % 2 === 0 ? String(index / 2 + 1) : '&',
  );
}

export function countPattern(pattern: RhythmPattern): string[] {
  if (pattern.beatUnit === 8) {
    return Array.from({ length: pattern.beats * (pattern.subdivision / 8) }, (_, index) => {
      if (pattern.subdivision === 16 && index % 2 !== 0) return '&';
      const eighth = pattern.subdivision === 16 ? index / 2 : index;
      return pattern.beats === 12
        ? [String(eighth / 3 + 1), 'la', 'li'][eighth % 3]
        : String(eighth + 1);
    });
  }
  if (pattern.subdivision === 8) return countEighthNotes(pattern.beats);
  return Array.from(
    { length: pattern.beats * 4 },
    (_, index) => [String(Math.floor(index / 4) + 1), 'e', '&', 'a'][index % 4],
  );
}

export function metronomeBeats(pattern: RhythmPattern): number {
  return pattern.beatUnit === 8 ? pattern.beats / 3 : pattern.beats;
}
