import { Injectable, OnDestroy, signal } from '@angular/core';
import { PlayableNote } from '../domain/explorer';

const NOTE_DURATION_SECONDS = 0.85;
const MELODY_STEP_MS = 430;
const STRUM_STEP_MS = 55;

@Injectable({ providedIn: 'root' })
export class AudioPlayback implements OnDestroy {
  readonly selectedPitch = signal<number | null>(null);
  readonly playing = signal(false);
  readonly error = signal('');
  private context?: AudioContext;
  private generation = 0;
  private readonly oscillators = new Set<OscillatorNode>();

  stop(): void {
    this.generation++;
    this.playing.set(false);
    this.selectedPitch.set(null);
    for (const oscillator of this.oscillators) oscillator.stop();
    this.oscillators.clear();
  }

  async playNote(note: PlayableNote): Promise<void> {
    this.stop();
    this.selectedPitch.set(note.pitch);
    await this.playTone(note.midi, this.generation);
  }

  async playMelody(notes: PlayableNote[]): Promise<void> {
    this.stop();
    const generation = this.generation;
    this.playing.set(true);
    for (const note of notes) {
      if (generation !== this.generation) return;
      this.selectedPitch.set(note.pitch);
      await this.playTone(note.midi, generation);
      if (generation !== this.generation) return;
      await this.delay(MELODY_STEP_MS);
    }
    if (generation === this.generation) {
      this.playing.set(false);
      this.selectedPitch.set(null);
    }
  }

  async strum(midiNotes: number[]): Promise<void> {
    this.stop();
    const generation = this.generation;
    for (const midi of midiNotes) {
      if (generation !== this.generation) return;
      await this.playTone(midi, generation);
      if (generation !== this.generation) return;
      await this.delay(STRUM_STEP_MS);
    }
  }

  ngOnDestroy(): void {
    this.stop();
    void this.context?.close();
  }

  private async playTone(midi: number, generation: number): Promise<void> {
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      // A user may change chords while the browser is resuming audio.
      if (generation !== this.generation) return;
      this.error.set('');
      const time = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.22, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      this.oscillators.add(oscillator);
      oscillator.onended = () => {
        this.oscillators.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(time);
      oscillator.stop(time + NOTE_DURATION_SECONDS);
    } catch {
      this.error.set('Audio is unavailable in this browser. You can still explore every note.');
    }
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
