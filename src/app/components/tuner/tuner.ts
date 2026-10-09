import { Component, computed, inject, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { STANDARD_TUNING } from '../../domain/instrument';
import { TunerEngine } from '../../services/tuner-engine';

@Component({
  selector: 'app-tuner',
  imports: [DecimalPipe],
  templateUrl: './tuner.html',
  styleUrl: './tuner.css',
})
export class Tuner implements OnDestroy {
  readonly engine = inject(TunerEngine);
  readonly strings = STANDARD_TUNING;
  readonly needlePosition = computed(() =>
    Math.max(0, Math.min(100, 50 + (this.engine.reading()?.cents ?? 0))),
  );
  readonly pitchStatus = computed(() => {
    const reading = this.engine.reading();
    if (!reading)
      return this.engine.listening() ? 'Play one string at a time' : 'Ready when you are';
    if (Math.abs(reading.cents) <= 5) return 'In tune';
    return reading.cents < 0 ? 'Too low · tighten the string' : 'Too high · loosen the string';
  });

  selectString(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.engine.targetMidi.set(value === 'auto' ? undefined : Number(value));
    this.engine.frequency.set(null);
  }

  toggle(): void {
    if (this.engine.listening() || this.engine.requesting()) this.engine.stop();
    else void this.engine.start();
  }

  ngOnDestroy(): void {
    this.engine.stop();
  }
}
