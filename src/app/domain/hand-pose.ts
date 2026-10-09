import { ChordShape } from './chord-shapes';
import { STANDARD_TUNING } from './instrument';

export const FINGERS = [
  { number: 1, name: 'Index', color: '#365c43' },
  { number: 2, name: 'Middle', color: '#476c91' },
  { number: 3, name: 'Ring', color: '#9b692b' },
  { number: 4, name: 'Pinky', color: '#80618e' },
] as const;

/** SVG coordinates shared by the finger paths and their string contact points. */
export const NECK_LAYOUT = {
  firstContactX: 170,
  fretWidth: 90,
  lowStringY: 70,
  stringSpacing: 24,
  fingerBaseX: 205,
  fingerSpacing: 35,
  fingerBaseY: 260,
} as const;

export function contactX(shape: ChordShape, stringIndex: number): number {
  const fretOffset = shape.frets[stringIndex] - shape.startFret;
  return NECK_LAYOUT.firstContactX + fretOffset * NECK_LAYOUT.fretWidth;
}

export function stringY(stringIndex: number): number {
  return NECK_LAYOUT.lowStringY + stringIndex * NECK_LAYOUT.stringSpacing;
}

export function stringNamesAtFret(shape: ChordShape, fret: number): string {
  return shape.frets
    .flatMap((value, index) => (value === fret ? [STANDARD_TUNING[index].label] : []))
    .join(', ');
}

export function getFingerPlacements(shape: ChordShape) {
  return FINGERS.map((finger) => {
    const pressedStrings = shape.fingers.flatMap((number, index) =>
      number === finger.number && shape.frets[index] > 0 ? [index] : [],
    );
    const active = pressedStrings.length > 0;
    const barre = finger.number === 1 ? shape.barre : undefined;
    const firstString = pressedStrings[0];
    const x = active ? contactX(shape, firstString) : NECK_LAYOUT.firstContactX;
    const y = stringY(barre?.from ?? firstString ?? 5);
    const baseX = NECK_LAYOUT.fingerBaseX + (finger.number - 1) * NECK_LAYOUT.fingerSpacing;
    let path: string;
    let instruction: string;

    if (barre) {
      path = `M ${baseX} 260 C ${baseX} 220, ${x} 235, ${x} ${stringY(barre.to)} L ${x} ${y}`;
      instruction = `Barre fret ${barre.fret} · ${STANDARD_TUNING[barre.from].label} to ${STANDARD_TUNING[barre.to].label}`;
    } else if (active) {
      path = `M ${baseX} 260 C ${baseX} 215, ${x + 15} ${y + 65}, ${x} ${y}`;
      instruction = pressedStrings
        .map((index) => `${STANDARD_TUNING[index].label} string · fret ${shape.frets[index]}`)
        .join('; ');
    } else {
      // An unused finger curls above the palm, away from the strings.
      path = `M ${baseX} 260 C ${baseX + 25} 232, ${baseX + 40} 205, ${baseX + 16} 212 Q ${baseX - 3} 214 ${baseX + 5} 233`;
      instruction = 'Not needed for this shape';
    }

    return { ...finger, x, y, path, active, instruction };
  });
}
