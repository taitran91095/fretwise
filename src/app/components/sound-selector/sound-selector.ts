import { Component, computed, input, output } from '@angular/core';
import {
  ROOTS,
  SCALE_OPTIONS,
  SCALES,
  ScaleKey,
  CHORD_OPTIONS,
  CHORDS,
  ChordKey,
} from '../../domain/music';
import { ExploreMode } from '../../domain/explorer';

@Component({
  selector: 'app-sound-selector',
  templateUrl: './sound-selector.html',
  styleUrl: './sound-selector.css',
})
export class SoundSelector {
  readonly root = input.required<string>();
  readonly scaleKey = input.required<ScaleKey>();
  readonly chordKey = input<ChordKey>('major');
  readonly chord = computed(() => CHORDS[this.chordKey()]);
  readonly chordOptions = CHORD_OPTIONS;
  readonly chordChange = output<ChordKey>();
  readonly mode = input.required<ExploreMode>();
  readonly rootChange = output<string>();
  readonly scaleChange = output<ScaleKey>();
  readonly modeChange = output<ExploreMode>();
  readonly roots = ROOTS;
  readonly scaleOptions = SCALE_OPTIONS;
  readonly scale = computed(() => SCALES[this.scaleKey()]);

  onRootChange(event: Event): void {
    this.rootChange.emit((event.target as HTMLSelectElement).value);
  }

  onScaleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (this.mode() === 'chord') this.chordChange.emit(value as ChordKey);
    else this.scaleChange.emit(value as ScaleKey);
  }
}
