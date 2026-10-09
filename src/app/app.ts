import { Component, inject, signal } from '@angular/core';
import { ChordShapePicker } from './components/chord-shape-picker/chord-shape-picker';
import { Fretboard } from './components/fretboard/fretboard';
import { NoteExplorer } from './components/note-explorer/note-explorer';
import { SoundSelector } from './components/sound-selector/sound-selector';
import { PracticeTools } from './components/practice-tools/practice-tools';
import { PwaStatus } from './components/pwa-status/pwa-status';
import { AudioPlayback } from './services/audio-playback';
import { ExplorerState } from './services/explorer-state';

@Component({
  selector: 'app-root',
  imports: [SoundSelector, NoteExplorer, ChordShapePicker, Fretboard, PracticeTools, PwaStatus],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly explorer = inject(ExplorerState);
  readonly audio = inject(AudioPlayback);
  readonly showDegrees = signal(false);

  togglePlayback(): void {
    if (this.audio.playing()) this.audio.stop();
    else void this.audio.playMelody(this.explorer.melody());
  }

  strum(): void {
    void this.audio.strum(this.explorer.strumNotes());
  }
}
