import { Component, computed, input, output } from '@angular/core';
import {
  ChordShape,
  describeShape,
  shapeFretRange,
  shapeInstruction,
} from '../../domain/chord-shapes';
import { ChordDiagram } from '../chord-diagram/chord-diagram';
import { HandPosition } from '../hand-position/hand-position';

@Component({
  selector: 'app-chord-shape-picker',
  imports: [ChordDiagram, HandPosition],
  templateUrl: './chord-shape-picker.html',
  styleUrl: './chord-shape-picker.css',
})
export class ChordShapePicker {
  readonly name = input.required<string>();
  readonly shapes = input.required<ChordShape[]>();
  readonly selectedIndex = input<number | null>(0);
  readonly shapeSelected = output<number | null>();
  readonly strumRequested = output<void>();
  readonly shapeGroups = ['Open position', 'CAGED positions'] as const;
  readonly shapeSummary = describeShape;
  readonly fretRange = shapeFretRange;
  readonly instruction = shapeInstruction;
  readonly families = ['C', 'A', 'G', 'E', 'D'] as const;
  readonly activeShape = computed(() => {
    const index = this.selectedIndex();
    return index === null ? undefined : this.shapes()[index];
  });
}
