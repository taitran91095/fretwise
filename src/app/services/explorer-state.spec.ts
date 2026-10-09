import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { ExplorerState } from './explorer-state';
import { AudioPlayback } from './audio-playback';

describe('ExplorerState', () => {
  let state: ExplorerState;
  let stop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    stop = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: AudioPlayback, useValue: { stop } }] });
    state = TestBed.inject(ExplorerState);
  });

  it('starts with the requested C major scale and no active chord shape', () => {
    expect(state.name()).toBe('C major');
    expect(state.notes().map((note) => note.name)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(state.activeShape()).toBeUndefined();
  });

  it.each([
    ['majorPentatonic', 'major'],
    ['minorPentatonic', 'minor'],
  ] as const)('converts %s into the %s chord family', (scale, family) => {
    state.setScale(scale);
    state.setMode('chord');
    expect(state.scaleKey()).toBe(family);
    expect(state.notes()).toHaveLength(3);
    expect(state.activeShape()).toBeDefined();
  });

  it('resets fingering and stops audio when root or quality changes', () => {
    state.setMode('chord');
    state.chooseShape(2);
    state.setRoot('F');
    expect(state.shapeIndex()).toBe(0);
    expect(state.name()).toBe('F major');
    expect(state.activeShape()?.startFret).toBe(1);
    state.chooseShape(null);
    state.setScale('minor');
    expect(state.shapeIndex()).toBe(0);
    expect(state.notes().map((note) => note.name)).toEqual(['F', 'A♭', 'C']);
    expect(stop).toHaveBeenCalled();
  });

  it('clears the selected grip without changing the chord notes', () => {
    state.setMode('chord');
    state.chooseShape(null);
    expect(state.activeShape()).toBeUndefined();
    expect(state.notes().map((note) => note.name)).toEqual(['C', 'E', 'G']);
  });

  it('strums only playable strings, from bass to treble', () => {
    state.setMode('chord');
    expect(state.strumNotes()).toEqual([48, 52, 55, 60, 64]);
    state.chooseShape(null);
    expect(state.strumNotes()).toEqual([]);
  });

  it('plays an ascending scale with the tonic in the next octave', () => {
    expect(state.melody().map((note) => note.midi)).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
    state.setRoot('B');
    expect(state.melody().map((note) => note.midi)).toEqual([71, 73, 75, 76, 78, 80, 82, 83]);
  });
});
