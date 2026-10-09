import { Component, computed, inject, OnDestroy } from '@angular/core';
import { MetronomeEngine } from '../../services/metronome-engine';

@Component({
  selector: 'app-metronome',
  templateUrl: './metronome.html',
  styleUrl: './metronome.css',
})
export class Metronome implements OnDestroy {
  readonly engine = inject(MetronomeEngine);
  readonly beats = computed(() =>
    Array.from({ length: this.engine.beatsPerBar() }, (_, i) => i + 1),
  );
  private taps: number[] = [];

  changeTempo(event: Event): void {
    this.engine.setBpm(Number((event.target as HTMLInputElement).value));
  }

  changeBeats(event: Event): void {
    this.engine.setBeats(Number((event.target as HTMLSelectElement).value));
  }

  tapTempo(): void {
    const now = Date.now();
    if (this.taps.length && now - this.taps[this.taps.length - 1] > 2000) this.taps = [];
    this.taps.push(now);
    this.taps = this.taps.slice(-5);
    if (this.taps.length > 1) {
      const interval = (now - this.taps[0]) / (this.taps.length - 1);
      if (interval > 0) this.engine.setBpm(60000 / interval);
    }
  }

  toggle(): void {
    if (this.engine.playing()) this.engine.stop();
    else void this.engine.start();
  }

  ngOnDestroy(): void {
    this.engine.stop();
  }
}
