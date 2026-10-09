import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MetronomeEngine } from './metronome-engine';

describe('MetronomeEngine', () => {
  let engine: MetronomeEngine;
  let resume: ReturnType<typeof vi.fn>;
  let close: ReturnType<typeof vi.fn>;
  const clicks: Array<{
    frequency: { value: number };
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }> = [];
  beforeEach(() => {
    vi.useFakeTimers();
    clicks.length = 0;
    resume = vi.fn().mockResolvedValue(undefined);
    close = vi.fn().mockResolvedValue(undefined);
    const epoch = Date.now();
    vi.stubGlobal(
      'AudioContext',
      class {
        destination = {};
        get currentTime() {
          return (Date.now() - epoch) / 1000;
        }
        resume = resume;
        close = close;
        createOscillator() {
          const oscillator = {
            frequency: { value: 0 },
            connect: vi.fn(),
            disconnect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            onended: null,
          };
          clicks.push(oscillator);
          return oscillator;
        }
        createGain() {
          return {
            gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
            connect: vi.fn(),
            disconnect: vi.fn(),
          };
        }
      },
    );
    engine = new MetronomeEngine();
  });
  afterEach(() => {
    engine.ngOnDestroy();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('schedules audio-clock beats at the selected tempo and accents each new bar', async () => {
    engine.setBpm(120);
    engine.setBeats(3);
    await engine.start();
    await vi.advanceTimersByTimeAsync(1550);
    expect(clicks.map((click) => click.frequency.value)).toEqual([1200, 800, 800, 1200]);
    expect(clicks[0].start).toHaveBeenCalledWith(0.03);
    expect(clicks[1].start).toHaveBeenCalledWith(0.53);
    expect(engine.beat()).toBe(1);
  });

  it('cancels clicks and visual updates when stopped', async () => {
    await engine.start();
    engine.stop();
    await vi.advanceTimersByTimeAsync(2000);
    expect(clicks).toHaveLength(1);
    expect(clicks[0].stop).toHaveBeenLastCalledWith();
    expect(engine.playing()).toBe(false);
    expect(engine.beat()).toBe(0);
  });

  it('does not start after closing while audio resumes', async () => {
    let resolve!: () => void;
    resume.mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    const pending = engine.start();
    engine.stop();
    resolve();
    await pending;
    expect(clicks).toHaveLength(0);
  });

  it('clamps tempo and bar length to usable limits', () => {
    engine.setBpm(999);
    expect(engine.bpm()).toBe(240);
    engine.setBpm(-10);
    expect(engine.bpm()).toBe(30);
    engine.setBpm(NaN);
    expect(engine.bpm()).toBe(30);
    engine.setBeats(99);
    expect(engine.beatsPerBar()).toBe(8);
  });
});
