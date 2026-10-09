import { describe, expect, it } from 'vitest';
import { getChordShapes } from './chord-shapes';
import { getFingerPlacements, contactX, stringY, stringNamesAtFret } from './hand-pose';
import { ROOTS, CHORD_OPTIONS } from './music';

describe('Hand pose', () => {
  it('places the C major fingers on B1, D2, and A3, leaving the pinky unused', () => {
    const fingers = getFingerPlacements(getChordShapes('C', false)[0]);
    expect(fingers.map((finger) => [finger.active, finger.x, finger.y])).toEqual([
      [true, 170, 166],
      [true, 260, 118],
      [true, 350, 94],
      [false, 170, 190],
    ]);
    expect(fingers[3].instruction).toBe('Not needed for this shape');
  });

  it('extends the index to the bass edge of an E-shaped barre', () => {
    const shape = getChordShapes('F', true).find((shape) => shape.id === 'E')!;
    const index = getFingerPlacements(shape)[0];
    expect(index.y).toBe(70);
    expect(index.path).toContain('L 170 70');
    expect(index.instruction).toBe('Barre fret 1 · Low E to High e');
  });

  it('starts an A-shaped barre on the A string, leaving low E muted', () => {
    const shape = getChordShapes('C', false).find((shape) => shape.id === 'A')!;
    expect(getFingerPlacements(shape)[0].y).toBe(94);
    expect(stringNamesAtFret(shape, -1)).toBe('Low E');
  });

  it('ends a partial G-shape barre at B rather than covering high e', () => {
    const shape = getChordShapes('E', false).find((shape) => shape.id === 'G-partial')!;
    const index = getFingerPlacements(shape)[0];
    expect(index.path).toContain('170 166 L 170 118');
    expect(index.instruction).toBe('Barre fret 9 · D to B');
  });

  it('aligns every active fingertip with a real chord contact across all roots and families', () => {
    for (const root of ROOTS)
      for (const { key } of CHORD_OPTIONS) {
        for (const shape of getChordShapes(root, key)) {
          for (const finger of getFingerPlacements(shape)) {
            if (!finger.active) continue;
            const string = shape.fingers.findIndex(
              (number, i) => number === finger.number && shape.frets[i] > 0,
            );
            expect(finger.x).toBe(contactX(shape, string));
            expect(finger.y).toBe(
              stringY(finger.number === 1 && shape.barre ? shape.barre.from : string),
            );
            expect(finger.path).not.toContain('NaN');
          }
        }
      }
  });
});
