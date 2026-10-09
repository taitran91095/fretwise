import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioPlayback } from './audio-playback';

function createAudioHarness() {
  const oscillators: Array<{
    frequency: { value: number };
    type: string;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
  }> = [];
  const resume = vi.fn().mockResolvedValue(undefined);
  const close = vi.fn().mockResolvedValue(undefined);

  class FakeAudioContext {
    currentTime = 0;
    destination = {};
    resume = resume;
    close = close;
    createOscillator() {
      const oscillator = {
        frequency: { value: 0 },
        type: '',
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null as (() => void) | null,
      };
      oscillators.push(oscillator);
      return oscillator;
    }
    createGain() {
      return {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
  }
  vi.stubGlobal('AudioContext', FakeAudioContext);
  return { oscillators, resume, close };
}

describe('AudioPlayback', () => {
  let audio: AudioPlayback;
  let harness: ReturnType<typeof createAudioHarness>;
  beforeEach(() => {
    vi.useFakeTimers();
    harness = createAudioHarness();
    audio = TestBed.inject(AudioPlayback);
  });
  afterEach(() => {
    audio.ngOnDestroy();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('converts MIDI pitch into frequency and resumes browser audio', async () => {
    await audio.playNote({ pitch: 9, midi: 69 });
    expect(harness.resume).toHaveBeenCalledOnce();
    expect(harness.oscillators[0].frequency.value).toBe(440);
    expect(audio.selectedPitch()).toBe(9);
    expect(harness.oscillators[0].start).toHaveBeenCalledWith(0);
  });

  it('stops the previous tone when a different note is selected', async () => {
    await audio.playNote({ pitch: 0, midi: 60 });
    const first = harness.oscillators[0];
    await audio.playNote({ pitch: 4, midi: 64 });
    expect(first.stop).toHaveBeenLastCalledWith();
    expect(audio.selectedPitch()).toBe(4);
  });

  it('cancels a melody before any later note can start', async () => {
    const playback = audio.playMelody([
      { pitch: 0, midi: 60 },
      { pitch: 2, midi: 62 },
    ]);
    await vi.advanceTimersByTimeAsync(0);
    expect(harness.oscillators).toHaveLength(1);
    expect(audio.playing()).toBe(true);
    audio.stop();
    await vi.runAllTimersAsync();
    await playback;
    expect(harness.oscillators).toHaveLength(1);
    expect(audio.playing()).toBe(false);
    expect(audio.selectedPitch()).toBeNull();
  });

  it('does not start a stale tone if selection changes while audio resumes', async () => {
    let resume!: () => void;
    harness.resume.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resume = resolve;
        }),
    );
    const pending = audio.playNote({ pitch: 0, midi: 60 });
    audio.stop();
    resume();
    await pending;
    expect(harness.oscillators).toHaveLength(0);
  });

  it('strums tones in sequence and lets them ring together', async () => {
    const playback = audio.strum([48, 52, 55]);
    await vi.runAllTimersAsync();
    await playback;
    expect(harness.oscillators).toHaveLength(3);
    // Each tone has only its natural stop, not a stop caused by the next string.
    for (const oscillator of harness.oscillators)
      expect(oscillator.stop).toHaveBeenCalledExactlyOnceWith(0.85);
  });

  it('shows a recoverable message when Web Audio is unavailable', async () => {
    vi.stubGlobal('AudioContext', undefined);
    await audio.playNote({ pitch: 0, midi: 60 });
    expect(audio.error()).toContain('Audio is unavailable');
  });

  it('releases the browser audio context when destroyed', async () => {
    await audio.playNote({ pitch: 0, midi: 60 });
    audio.ngOnDestroy();
    expect(harness.close).toHaveBeenCalled();
  });
});
