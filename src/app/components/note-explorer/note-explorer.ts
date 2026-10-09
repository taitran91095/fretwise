import { Component, input, output } from '@angular/core';
import { Note, ScaleDefinition } from '../../domain/music';
import { ExploreMode, PlayableNote } from '../../domain/explorer';

@Component({
  selector: 'app-note-explorer',
  templateUrl: './note-explorer.html',
  styleUrl: './note-explorer.css',
})
export class NoteExplorer {
  readonly name = input.required<string>();
  readonly notes = input.required<Note[]>();
  readonly scale = input.required<ScaleDefinition>();
  readonly mode = input.required<ExploreMode>();
  readonly minor = input(false);
  readonly selectedPitch = input<number | null>(null);
  readonly playing = input(false);
  readonly audioError = input('');
  readonly noteSelected = output<PlayableNote>();
  readonly playRequested = output<void>();
}
