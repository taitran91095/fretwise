import { getRhythmStyle } from './rhythm-styles';
import { Pick, PickingFinger, RhythmPattern, RhythmStyleId, Stroke } from './rhythm-types';

interface PatternOptions {
  readonly beats?: RhythmPattern['beats'];
  readonly beatUnit?: 4 | 8;
  readonly subdivision?: 8 | 16;
  readonly accents?: readonly number[];
  readonly tip?: string;
}

function base(
  style: RhythmStyleId,
  id: string,
  name: string,
  description: string,
  options: PatternOptions,
): RhythmPattern {
  const family = getRhythmStyle(style);
  return {
    id,
    style,
    name,
    description,
    feel: family.name,
    beats: options.beats ?? 4,
    beatUnit: options.beatUnit ?? 4,
    subdivision: options.subdivision ?? 8,
    tip: options.tip ?? family.tip,
    accents: options.accents ?? [0],
    mutedSteps: [],
  };
}

/** Tokens are evenly spaced grid slots. D/U = strokes, B = bass, X = muted stroke, - = no attack. */
export function strum(
  style: RhythmStyleId,
  id: string,
  name: string,
  code: string,
  description: string,
  options: PatternOptions = {},
): RhythmPattern {
  const tokens = code.split(' ');
  const pattern = base(style, id, name, description, options);
  return {
    ...pattern,
    accents: pattern.accents.filter((slot) => tokens[slot] !== '-'),
    strokes: tokens.map((stroke) => (stroke === '-' ? '–' : (stroke as Stroke))),
  };
}

/** String-number tokens are plucks; 5+2 is a pinch, - is no attack, X is a muted tap. */
export function picking(
  style: RhythmStyleId,
  id: string,
  name: string,
  code: string,
  description: string,
  options: PatternOptions = {},
): RhythmPattern {
  const tokens = code.split(' ');
  const pattern = base(style, id, name, description, options);
  const fingers: Record<number, PickingFinger> = { 1: 'a', 2: 'm', 3: 'i', 4: 'p', 5: 'p', 6: 'p' };
  return {
    ...pattern,
    accents: pattern.accents.filter((slot) => tokens[slot] !== '-'),
    picks: tokens.map((token): readonly Pick[] =>
      token === '-' || token === 'X'
        ? []
        : token
            .split('+')
            .map((string) => ({ string: Number(string), finger: fingers[Number(string)] })),
    ),
    mutedSteps: tokens.flatMap((token, index) => (token === 'X' ? [index] : [])),
  };
}
