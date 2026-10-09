import { Component, computed, input, output } from '@angular/core';
import { ROOTS, SCALE_OPTIONS, SCALES, ScaleKey } from '../../domain/music';
import { ExploreMode } from '../../domain/explorer';

@Component({
  selector: 'app-sound-selector',
  templateUrl: './sound-selector.html',
  styleUrl: './sound-selector.css',
})
export class SoundSelector {
  readonly root = input.required<string>();
  readonly scaleKey = input.required<ScaleKey>();
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
    this.scaleChange.emit((event.target as HTMLSelectElement).value as ScaleKey);
  }
}
