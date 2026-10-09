import { describe, expect, it } from 'vitest';
import { getChordShapes, describeShape, shapeFretRange, shapeInstruction } from './chord-shapes';
import { getNotes, ROOTS } from './music';
import { STANDARD_TUNING, FRET_COUNT } from './instrument';

describe('Chord shapes', () => {
  it('uses the standard C major open fingering', () => {
    const shape = getChordShapes('C', false)[0];
    expect(shape.frets).toEqual([-1, 3, 2, 0, 1, 0]);
    expect(shape.fingers).toEqual([0, 3, 2, 0, 1, 0]);
    expect(describeShape(shape)).toContain('Low E: muted; A: fret 3, finger 3');
  });

  it('offers all five CAGED families for every major chord', () => {
    for (const root of ROOTS) {
      expect([...new Set(getChordShapes(root, false).map((shape) => shape.family))].sort()).toEqual(
        ['A', 'C', 'D', 'E', 'G'],
      );
    }
  });

  it('moves the C shape up four frets to play E major', () => {
    const shape = getChordShapes('E', false).find((shape) => shape.id === 'C')!;
    expect(shape.frets).toEqual([-1, 7, 6, 4, 5, 4]);
    expect(shape.fingers).toEqual([0, 4, 3, 1, 2, 1]);
    expect(shape.barre).toEqual({ fret: 4, from: 3, to: 5 });
    expect(shapeFretRange(shape)).toBe('Frets 4–7');
    expect(shapeInstruction(shape)).toContain('from G to High e');
  });

  it('offers both the full G shape and a smaller complete-triad grip', () => {
    const shapes = getChordShapes('E', false);
    expect(shapes.find((shape) => shape.id === 'G')?.frets).toEqual([12, 11, 9, 9, 9, 12]);
    const partial = shapes.find((shape) => shape.id === 'G-partial')!;
    expect(partial.frets).toEqual([-1, -1, 9, 9, 9, 12]);
    expect(partial.barre).toEqual({ fret: 9, from: 2, to: 4 });
    expect(shapeInstruction(partial)).toContain('from D to B');
  });

  it('provides movable D major and minor grips without a barre', () => {
    const major = getChordShapes('E', false).find((shape) => shape.id === 'D')!;
    const minor = getChordShapes('E', true).find((shape) => shape.id === 'D')!;
    expect(major.frets).toEqual([-1, -1, 2, 4, 5, 4]);
    expect(minor.frets).toEqual([-1, -1, 2, 4, 5, 3]);
    expect(major.barre).toBeUndefined();
    expect(minor.barre).toBeUndefined();
    expect(shapeInstruction(major)).toContain('this grip needs no barre');
    expect(shapeFretRange(major)).toBe('Frets 2–5');
  });

  it('finds the same chord shapes for enharmonic root names', () => {
    expect(getChordShapes('C♯', false)).toEqual(getChordShapes('D♭', false));
  });

  it('provides playable complete triads within the displayed frets for every root and family', () => {
    for (const root of ROOTS) {
      for (const minor of [false, true]) {
        const shapes = getChordShapes(root, minor);
        expect(shapes.length).toBeGreaterThan(0);
        const expected = getNotes(root, minor ? 'minor' : 'major', true)
          .map((note) => note.pitch)
          .sort((a, b) => a - b);
        for (const shape of shapes) {
          const pitches = new Set<number>();
          expect(shape.frets).toHaveLength(6);
          expect(shape.fingers).toHaveLength(6);
          shape.frets.forEach((fret, index) => {
            expect(fret).toBeGreaterThanOrEqual(-1);
            expect(fret).toBeLessThanOrEqual(FRET_COUNT);
            if (fret >= 0) pitches.add((STANDARD_TUNING[index].midi + fret) % 12);
            if (fret > 0) {
              expect(shape.fingers[index]).toBeGreaterThanOrEqual(1);
              expect(shape.fingers[index]).toBeLessThanOrEqual(4);
              expect(fret).toBeGreaterThanOrEqual(shape.startFret);
              expect(fret).toBeLessThan(shape.startFret + 4);
            } else expect(shape.fingers[index]).toBe(0);
          });
          expect([...pitches].sort((a, b) => a - b)).toEqual(expected);
          if (shape.barre) {
            for (let string = shape.barre.from; string <= shape.barre.to; string++) {
              expect(shape.frets[string]).toBeGreaterThanOrEqual(shape.barre.fret);
            }
          }
        }
      }
    }
  });
});
