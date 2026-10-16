import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChordShapePicker } from '../../components/chord-shape-picker/chord-shape-picker';
import { Fretboard } from '../../components/fretboard/fretboard';
import { NoteExplorer } from '../../components/note-explorer/note-explorer';
import { SoundSelector } from '../../components/sound-selector/sound-selector';
import { AudioPlayback } from '../../services/audio-playback';
import { ExplorerState } from '../../services/explorer-state';

@Component({
  selector: 'app-explorer-page',
  imports: [SoundSelector, NoteExplorer, ChordShapePicker, Fretboard],
  templateUrl: './explorer-page.html',
  styleUrl: './explorer-page.css',
})
export class ExplorerPage implements OnDestroy {
  readonly explorer = inject(ExplorerState);
  readonly audio = inject(AudioPlayback);
  readonly showDegrees = signal(false);

  constructor() {
    // Keep scale and chord choices when moving between practice pages.
    const mode = inject(ActivatedRoute).snapshot.data['mode'];
    this.explorer.mode.set(mode === 'chord' ? 'chord' : 'scale');
  }

  togglePlayback(): void {
    if (this.audio.playing()) this.audio.stop();
    else void this.audio.playMelody(this.explorer.melody());
  }

  strum(): void {
    void this.audio.strum(this.explorer.strumNotes());
  }

  ngOnDestroy(): void {
    this.audio.stop();
  }
}
