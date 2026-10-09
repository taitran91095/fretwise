import { Component, input, output } from '@angular/core';
import { CHROMATIC, Note } from '../../domain/music';
import { ChordShape } from '../../domain/chord-shapes';
import { ExploreMode, PlayableNote } from '../../domain/explorer';
import { FRET_COUNT, STANDARD_TUNING } from '../../domain/instrument';

@Component({
  selector: 'app-fretboard',
  templateUrl: './fretboard.html',
  styleUrl: './fretboard.css',
})
export class Fretboard {
  readonly notes = input.required<Note[]>();
  readonly mode = input.required<ExploreMode>();
  readonly activeShape = input<ChordShape>();
  readonly selectedPitch = input<number | null>(null);
  readonly showDegrees = input(false);
  readonly noteSelected = output<PlayableNote>();
  readonly degreesChange = output<boolean>();
  readonly fretCount = FRET_COUNT;
  readonly frets = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret);
  // The horizontal fretboard shows high e on top; chord shapes use low E first.
  readonly strings = [...STANDARD_TUNING].reverse();

  fingerAt(displayStringIndex: number, fret: number): number | null {
    const shape = this.activeShape();
    const shapeStringIndex = STANDARD_TUNING.length - 1 - displayStringIndex;
    return shape?.frets[shapeStringIndex] === fret ? shape.fingers[shapeStringIndex] : null;
  }

  fretNote(midi: number, fret: number): Note | undefined {
    return this.notes().find((note) => note.pitch === (midi + fret) % 12);
  }

  fretLabel(midi: number, fret: number): string {
    const note = this.fretNote(midi, fret);
    return note ? (this.showDegrees() ? note.degree : note.name) : '';
  }

  positionLabel(stringIndex: number, midi: number, fret: number): string {
    const finger = this.fingerAt(stringIndex, fret);
    return finger ? String(finger) : this.fretLabel(midi, fret);
  }

  positionDescription(stringIndex: number, midi: number, fret: number): string {
    const note = this.accessibleNote(midi, fret);
    const finger = this.fingerAt(stringIndex, fret);
    const string = this.strings[stringIndex].name;
    return `${note}, string ${string}${finger ? ', finger ' + finger : ''}`;
  }

  accessibleNote(midi: number, fret: number): string {
    const name = this.fretNote(midi, fret)?.name ?? CHROMATIC[(midi + fret) % 12];
    return `${name}, fret ${fret}`;
  }
}
