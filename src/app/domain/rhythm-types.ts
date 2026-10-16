export type RhythmKind = 'strumming' | 'fingerpicking';
export type PickingFinger = 'p' | 'i' | 'm' | 'a';
export type RhythmStyleId =
  | 'essentials'
  | 'pop'
  | 'ballad'
  | 'slow-rock'
  | 'funk'
  | 'rock'
  | 'disco'
  | 'reggae'
  | 'bolero'
  | 'rumba'
  | 'bossa-nova'
  | 'waltz'
  | 'boston'
  | 'country'
  | 'blues'
  | 'cha-cha';
export type Stroke = 'D' | 'U' | 'B' | 'X' | '–';

export interface LessonSource {
  readonly title: string;
  readonly url: string;
  readonly language: 'vi' | 'en';
}

export interface RhythmStyle {
  readonly id: RhythmStyleId;
  readonly name: string;
  readonly summary: string;
  readonly tip: string;
  readonly sources: readonly LessonSource[];
}

export interface Pick {
  /** String numbers run from high e (1) to low E (6). */
  readonly string: number;
  readonly finger: PickingFinger;
}

export interface RhythmPattern {
  readonly id: string;
  readonly style: RhythmStyleId;
  readonly name: string;
  readonly feel: string;
  /** Written meter numerator, not necessarily the number of metronome clicks. */
  readonly beats: 2 | 3 | 4 | 6 | 12;
  readonly beatUnit: 4 | 8;
  readonly subdivision: 8 | 16;
  readonly description: string;
  readonly tip: string;
  readonly accents: readonly number[];
  readonly mutedSteps: readonly number[];
  readonly strokes?: readonly Stroke[];
  readonly picks?: readonly (readonly Pick[])[];
}
