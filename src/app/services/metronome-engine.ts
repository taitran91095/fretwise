import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable()
export class MetronomeEngine implements OnDestroy {
  readonly bpm = signal(80);
  readonly beatsPerBar = signal(4);
  readonly volume = signal(80);
  readonly playing = signal(false);
  readonly beat = signal(0);
  readonly error = signal('');
  private context?: AudioContext;
  private timer?: ReturnType<typeof setInterval>;
  private nextBeatTime = 0;
  private nextBeat = 0;
  private generation = 0;
  private readonly visualTimers = new Set<ReturnType<typeof setTimeout>>();
  private readonly oscillators = new Set<OscillatorNode>();

  setBpm(value: number): void {
    if (Number.isFinite(value)) this.bpm.set(Math.max(30, Math.min(240, Math.round(value))));
  }

  setBeats(value: number): void {
    if (!Number.isFinite(value)) return;
    this.beatsPerBar.set(Math.max(1, Math.min(8, Math.round(value))));
    this.nextBeat = 0;
  }

  setVolume(value: number): void {
    if (Number.isFinite(value)) this.volume.set(Math.max(0, Math.min(100, Math.round(value))));
  }

  async start(): Promise<void> {
    this.stop();
    const generation = this.generation;
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      if (generation !== this.generation) return;
      this.error.set('');
      this.playing.set(true);
      this.nextBeatTime = this.context.currentTime + 0.03;
      this.nextBeat = 0;
      this.schedule();
      // Schedule against the audio clock so UI work does not delay the clicks.
      this.timer = setInterval(() => this.schedule(), 25);
    } catch {
      if (generation !== this.generation) return;
      this.error.set('Audio is unavailable. Try another browser.');
      this.stop();
    }
  }

  stop(): void {
    this.generation++;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    for (const timer of this.visualTimers) clearTimeout(timer);
    this.visualTimers.clear();
    for (const oscillator of this.oscillators) oscillator.stop();
    this.oscillators.clear();
    this.playing.set(false);
    this.beat.set(0);
  }

  ngOnDestroy(): void {
    this.stop();
    void this.context?.close();
  }

  private schedule(): void {
    const context = this.context!;
    // Skip missed beats after a tab has been suspended, rather than queueing a burst.
    if (this.nextBeatTime < context.currentTime) this.nextBeatTime = context.currentTime + 0.03;
    while (this.nextBeatTime < context.currentTime + 0.1) {
      const beat = this.nextBeat;
      const time = this.nextBeatTime;
      if (this.volume() > 0) this.playClick(beat, time);
      const timer = setTimeout(
        () => {
          this.beat.set(beat + 1);
          this.visualTimers.delete(timer);
        },
        Math.max(0, (time - context.currentTime) * 1000),
      );
      this.visualTimers.add(timer);
      this.nextBeatTime += 60 / this.bpm();
      this.nextBeat = (beat + 1) % this.beatsPerBar();
    }
  }

  private playClick(beat: number, time: number): void {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const peak = 0.75 * (this.volume() / 100);
    oscillator.frequency.value = beat === 0 ? 1200 : 800;
    // A stronger, longer click with a short attack avoids an abrupt volume jump.
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.002);
    gain.gain.setValueAtTime(peak, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    gain.gain.linearRampToValueAtTime(0, time + 0.07);
    oscillator.connect(gain);
    gain.connect(context.destination);
    this.oscillators.add(oscillator);
    oscillator.onended = () => {
      this.oscillators.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(time);
    oscillator.stop(time + 0.075);
  }
}
