import { STANDARD_TUNING, FRET_COUNT } from './instrument';
import { pitchClass, CHROMATIC, ChordKey } from './music';

export type CagedFamily = 'C' | 'A' | 'G' | 'E' | 'D';

export interface ChordShape {
  family: CagedFamily;
  id: string;
  name: string;
  group: 'Open position' | 'CAGED positions';
  hint?: string;
  omittedFifth?: boolean;
  frets: number[]; // Low E to high e; -1 = muted, 0 = open.
  fingers: number[]; // 1 = index, 2 = middle, 3 = ring, 4 = pinky.
  startFret: number;
  barre?: { fret: number; from: number; to: number };
}
interface Fingering {
  omittedFifth?: boolean;
  frets: number[];
  fingers: number[];
}

const OPEN_FINGERINGS: Record<string, Fingering> = {
  'C-major': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D-major': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'E-major': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'G-major': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'A-major': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'D-minor': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'E-minor': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'A-minor': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'C-maj7': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'E-maj7': { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  'A-maj7': { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  'G-maj7': { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
  'C-dominant7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], omittedFifth: true },
  'E-dominant7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'A-dominant7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
  'D-dominant7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'G-dominant7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'E-minor7': { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
  'A-minor7': { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'A-sus2': { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
  'D-sus2': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  'E-sus4': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
  'A-sus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'D-sus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
};

interface MovableFingering extends Fingering {
  barre?: { from: number; to: number };
}
interface CagedTemplate {
  family: CagedFamily;
  rootPitch: number;
  hint?: string;
  major: MovableFingering;
  minor?: MovableFingering;
  maj7?: MovableFingering;
  minor7?: MovableFingering;
  dominant7?: MovableFingering;
  sus2?: MovableFingering;
  sus4?: MovableFingering;
}

// Offsets are measured from the virtual nut; -1 means a muted string.
const CAGED_TEMPLATES: CagedTemplate[] = [
  {
    family: 'C',
    rootPitch: 0,
    hint: 'Four-fret reach',
    major: { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 4, 3, 1, 2, 1], barre: { from: 3, to: 5 } },
  },
  {
    family: 'A',
    rootPitch: 9,
    major: { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 1, 2, 3, 4, 1], barre: { from: 1, to: 5 } },
    minor: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1], barre: { from: 1, to: 5 } },
    maj7: { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 1, 3, 2, 4, 1], barre: { from: 1, to: 5 } },
    minor7: { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 1, 3, 1, 2, 1], barre: { from: 1, to: 5 } },
    dominant7: {
      frets: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { from: 1, to: 5 },
    },
    sus2: { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 1, 3, 4, 1, 1], barre: { from: 1, to: 5 } },
    sus4: { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 1, 2, 3, 4, 1], barre: { from: 1, to: 5 } },
  },
  {
    family: 'G',
    rootPitch: 7,
    hint: 'Wide stretch · partial grip available',
    major: { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 1, 1, 1, 4], barre: { from: 2, to: 4 } },
  },
  {
    family: 'E',
    rootPitch: 4,
    major: { frets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1], barre: { from: 0, to: 5 } },
    minor: { frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], barre: { from: 0, to: 5 } },
    maj7: { frets: [0, 2, 1, 1, 0, 0], fingers: [1, 4, 2, 3, 1, 1], barre: { from: 0, to: 5 } },
    minor7: { frets: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1], barre: { from: 0, to: 5 } },
    dominant7: {
      frets: [0, 2, 0, 1, 0, 0],
      fingers: [1, 3, 1, 2, 1, 1],
      barre: { from: 0, to: 5 },
    },
    sus4: { frets: [0, 2, 2, 2, 0, 0], fingers: [1, 2, 3, 4, 1, 1], barre: { from: 0, to: 5 } },
  },
  {
    family: 'D',
    rootPitch: 2,
    hint: 'Four-string grip · no barre',
    major: { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 1, 2, 4, 3] },
    minor: { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 1, 3, 4, 2] },
    sus2: { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 1, 3, 4, 1], barre: { from: 2, to: 5 } },
    sus4: { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 1, 2, 3, 4] },
  },
];

export function getChordShapes(root: string, qualityOrMinor: ChordKey | boolean): ChordShape[] {
  const rootPitch = pitchClass(root);
  const quality: ChordKey =
    typeof qualityOrMinor === 'boolean' ? (qualityOrMinor ? 'minor' : 'major') : qualityOrMinor;
  const shapes: ChordShape[] = [];
  const open = OPEN_FINGERINGS[`${CHROMATIC[rootPitch]}-${quality}`];

  if (open) {
    shapes.push({
      id: 'open',
      family: CHROMATIC[rootPitch] as CagedFamily,
      name: 'Open shape',
      group: 'Open position',
      startFret: 1,
      frets: [...open.frets],
      fingers: [...open.fingers],
      ...(open.omittedFifth ? { omittedFifth: true, hint: 'Classic grip · fifth omitted' } : {}),
    });
  }

  for (const template of CAGED_TEMPLATES) {
    const baseFret = (rootPitch - template.rootPitch + 12) % 12;
    const fingering = template[quality];
    if (!fingering || baseFret === 0) continue;
    const frets = fingering.frets.map((offset) => (offset < 0 ? -1 : baseFret + offset));
    if (Math.max(...frets) > FRET_COUNT) continue;
    shapes.push({
      id: template.family,
      family: template.family,
      name: `${template.family}-shape${fingering.barre ? ' barre' : ' grip'}`,
      group: 'CAGED positions',
      hint: quality === 'major' || quality === 'minor' ? template.hint : undefined,
      frets,
      fingers: [...fingering.fingers],
      startFret: baseFret,
      ...(fingering.barre ? { barre: { fret: baseFret, ...fingering.barre } } : {}),
    });
    if (template.family === 'G') {
      // Keep the complete triad on the top four strings, without the bass stretch.
      shapes.push({
        id: 'G-partial',
        family: 'G',
        name: 'G-shape partial',
        group: 'CAGED positions',
        hint: 'Smaller grip · top four strings',
        startFret: baseFret,
        frets: [-1, -1, baseFret, baseFret, baseFret, baseFret + 3],
        fingers: [0, 0, 1, 1, 1, 4],
        barre: { fret: baseFret, from: 2, to: 4 },
      });
    }
  }

  return shapes.sort((first, second) => {
    if (first.group === second.group) return first.startFret - second.startFret;
    return first.group === 'Open position' ? -1 : 1;
  });
}

export function shapeFretRange(shape: ChordShape): string {
  const lastFret = Math.max(...shape.frets);
  return `Frets ${shape.startFret}–${lastFret}`;
}

export function shapeInstruction(shape: ChordShape): string {
  if (shape.barre) {
    const { fret, from, to } = shape.barre;
    return `Lay your index finger across fret ${fret}, from ${STANDARD_TUNING[from].label} to ${STANDARD_TUNING[to].label}.`;
  }
  if (shape.id === 'open') return 'Let the strings marked ○ ring open. Skip strings marked ×.';
  return 'Use one fingertip per numbered position. Skip strings marked ×; this grip needs no barre.';
}

export function describeShape(shape: ChordShape): string {
  return shape.frets
    .map((fret, index) => {
      const string = STANDARD_TUNING[index].label;
      if (fret < 0) return `${string}: muted`;
      if (fret === 0) return `${string}: open`;
      return `${string}: fret ${fret}, finger ${shape.fingers[index]}`;
    })
    .join('; ');
}
