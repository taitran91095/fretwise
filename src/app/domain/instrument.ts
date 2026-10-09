/** Strings are ordered from low E to high e, as in a chord diagram. */
export const STANDARD_TUNING = [
  { name: 'E', label: 'Low E', midi: 40 },
  { name: 'A', label: 'A', midi: 45 },
  { name: 'D', label: 'D', midi: 50 },
  { name: 'G', label: 'G', midi: 55 },
  { name: 'B', label: 'B', midi: 59 },
  { name: 'e', label: 'High e', midi: 64 },
] as const;

export const FRET_COUNT = 15;
export const STRING_INDEXES = STANDARD_TUNING.map((_, index) => index);
export const DIAGRAM_FRET_LINES = [0, 1, 2, 3, 4];
