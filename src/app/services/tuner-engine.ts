import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { detectPitch, tuningReading } from '../domain/pitch-detection';

@Injectable()
export class TunerEngine implements OnDestroy {
  readonly listening = signal(false);
  readonly requesting = signal(false);
  readonly error = signal('');
  readonly frequency = signal<number | null>(null);
  readonly targetMidi = signal<number | undefined>(undefined);
  readonly reading = computed(() => {
    const frequency = this.frequency();
    return frequency === null ? null : tuningReading(frequency, this.targetMidi());
  });
  private context?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private stream?: MediaStream;
  private timer?: ReturnType<typeof setInterval>;
  private generation = 0;

  async start(): Promise<void> {
    this.stop();
    this.error.set('');
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error.set('Microphone access needs HTTPS or localhost and a supported browser.');
      return;
    }
    const generation = this.generation;
    this.requesting.set(true);
    try {
      const context = new AudioContext();
      this.context = context;
      await context.resume();
      if (generation !== this.generation) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      // A panel can close while the browser permission prompt is still open.
      if (generation !== this.generation) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      this.source = context.createMediaStreamSource(stream);
      this.source.connect(analyser);
      // Do not connect the microphone to speakers: no monitoring or feedback.
      const samples = new Float32Array(analyser.fftSize);
      this.requesting.set(false);
      this.listening.set(true);
      this.timer = setInterval(() => {
        analyser.getFloatTimeDomainData(samples);
        this.frequency.set(detectPitch(samples, context.sampleRate));
      }, 100);
    } catch (error) {
      if (generation !== this.generation) return;
      this.stop();
      const name = error && typeof error === 'object' && 'name' in error ? error.name : '';
      this.error.set(
        name === 'NotAllowedError'
          ? 'Microphone permission was denied. Allow access in your browser and try again.'
          : name === 'NotFoundError'
            ? 'No microphone found. Connect a microphone and try again.'
            : 'Could not start the microphone. Check your device and browser settings.',
      );
    }
  }

  stop(): void {
    this.generation++;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.source?.disconnect();
    this.source = undefined;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    void this.context?.close();
    this.context = undefined;
    this.requesting.set(false);
    this.listening.set(false);
    this.frequency.set(null);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
