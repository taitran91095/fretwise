import { computed, inject, Injectable, signal } from '@angular/core';
import { getChordShapes } from '../domain/chord-shapes';
import { ExploreMode, PlayableNote } from '../domain/explorer';
import {
  getNotes,
  getChordNotes,
  CHORDS,
  ChordKey,
  isMinorScale,
  SCALES,
  ScaleKey,
} from '../domain/music';
import { STANDARD_TUNING } from '../domain/instrument';
import { AudioPlayback } from './audio-playback';

@Injectable({ providedIn: 'root' })
export class ExplorerState {
  private readonly audio = inject(AudioPlayback);
  readonly root = signal('C');
  readonly scaleKey = signal<ScaleKey>('major');
  readonly chordKey = signal<ChordKey>('major');
  readonly chord = computed(() => CHORDS[this.chordKey()]);
  readonly mode = signal<ExploreMode>('scale');
  readonly shapeIndex = signal<number | null>(0);
  readonly scale = computed(() => SCALES[this.scaleKey()]);
  readonly minor = computed(() => isMinorScale(this.scaleKey()));
  readonly notes = computed(() =>
    this.mode() === 'chord'
      ? getChordNotes(this.root(), this.chordKey())
      : getNotes(this.root(), this.scaleKey()),
  );
  readonly shapes = computed(() => getChordShapes(this.root(), this.chordKey()));
  readonly name = computed(() => {
    const quality =
      this.mode() === 'chord' ? this.chord().name.toLowerCase() : this.scale().name.toLowerCase();
    return `${this.root()} ${quality}`;
  });
  readonly activeShape = computed(() => {
    const index = this.shapeIndex();
    return this.mode() === 'chord' && index !== null ? this.shapes()[index] : undefined;
  });
  readonly melody = computed<PlayableNote[]>(() => {
    const notes = this.notes();
    const rootMidi = 60 + notes[0].pitch;
    return [
      ...notes.map((note) => ({ pitch: note.pitch, midi: rootMidi + note.interval })),
      { pitch: notes[0].pitch, midi: rootMidi + 12 },
    ];
  });
  readonly strumNotes = computed(() => {
    const shape = this.activeShape();
    return shape
      ? shape.frets.flatMap((fret, index) => (fret < 0 ? [] : [STANDARD_TUNING[index].midi + fret]))
      : [];
  });

  setRoot(root: string): void {
    this.root.set(root);
    this.resetSelection();
  }

  setScale(scale: ScaleKey): void {
    this.scaleKey.set(scale);
    if (this.mode() === 'chord') this.normalizeChordFamily();
    this.resetSelection();
  }

  setChord(chord: ChordKey): void {
    this.chordKey.set(chord);
    this.resetSelection();
  }

  setMode(mode: ExploreMode): void {
    this.mode.set(mode);
    this.normalizeChordFamily();
    this.resetSelection();
  }

  chooseShape(index: number | null): void {
    this.audio.stop();
    this.shapeIndex.set(index);
  }

  private normalizeChordFamily(): void {
    if (this.mode() === 'chord') {
      const quality = this.minor() ? 'minor' : 'major';
      this.scaleKey.set(quality);
      this.chordKey.set(quality);
    }
  }

  private resetSelection(): void {
    this.audio.stop();
    this.shapeIndex.set(0);
  }
}
