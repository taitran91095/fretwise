import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Metronome } from '../metronome/metronome';
import { Tuner } from '../tuner/tuner';
import { MetronomeEngine } from '../../services/metronome-engine';
import { TunerEngine } from '../../services/tuner-engine';

type PracticeTool = 'metronome' | 'tuner';

@Component({
  selector: 'app-practice-tools',
  imports: [Metronome, Tuner],
  providers: [MetronomeEngine, TunerEngine],
  templateUrl: './practice-tools.html',
  styleUrl: './practice-tools.css',
})
export class PracticeTools {
  // This owner outlives the popup; hiding controls must not stop its audio engine.
  readonly metronome = inject(MetronomeEngine);
  readonly menuOpen = signal(false);
  readonly activeTool = signal<PracticeTool | null>(null);
  private readonly launcher = viewChild<ElementRef<HTMLButtonElement>>('launcher');

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  selectTool(tool: PracticeTool): void {
    // Keep metronome clicks out of the tuner's microphone input.
    if (tool === 'tuner') this.metronome.stop();
    this.activeTool.set(tool);
    this.menuOpen.set(false);
  }

  closeTool(): void {
    this.activeTool.set(null);
    this.launcher()?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  dismiss(): void {
    if (!this.menuOpen() && !this.activeTool()) return;
    this.menuOpen.set(false);
    this.closeTool();
  }
}
