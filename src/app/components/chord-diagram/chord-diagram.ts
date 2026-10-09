import { Component, input } from '@angular/core';
import { ChordShape, describeShape } from '../../domain/chord-shapes';
import { STRING_INDEXES, DIAGRAM_FRET_LINES } from '../../domain/instrument';

@Component({
  selector: 'app-chord-diagram',
  templateUrl: './chord-diagram.html',
  styleUrl: './chord-diagram.css',
})
export class ChordDiagram {
  readonly shape = input.required<ChordShape>();
  readonly diagramStrings = STRING_INDEXES;
  readonly diagramFrets = DIAGRAM_FRET_LINES;
  readonly shapeSummary = describeShape;
}
