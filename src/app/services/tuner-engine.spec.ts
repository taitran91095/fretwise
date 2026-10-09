import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TunerEngine } from './tuner-engine';

describe('TunerEngine', () => {
  let engine: TunerEngine;
  let getUserMedia: ReturnType<typeof vi.fn>;
  let stopTrack: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let close: ReturnType<typeof vi.fn>;
  let stream: { getTracks: () => Array<{ stop: ReturnType<typeof vi.fn> }> };
  beforeEach(() => {
    vi.useFakeTimers();
    stopTrack = vi.fn();
    disconnect = vi.fn();
    close = vi.fn().mockResolvedValue(undefined);
    stream = { getTracks: () => [{ stop: stopTrack }] };
    getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal(
      'AudioContext',
      class {
        sampleRate = 48000;
        resume = vi.fn().mockResolvedValue(undefined);
        close = close;
        createMediaStreamSource() {
          return { connect: vi.fn(), disconnect };
        }
        createAnalyser() {
          return {
            fftSize: 4096,
            getFloatTimeDomainData(samples: Float32Array) {
              for (let i = 0; i < samples.length; i++)
                samples[i] = 0.3 * Math.sin((2 * Math.PI * 110 * i) / 48000);
            },
          };
        }
      },
    );
    engine = new TunerEngine();
  });
  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('detects microphone pitch and releases all resources on stop', async () => {
    await engine.start();
    await vi.advanceTimersByTimeAsync(100);
    expect(engine.reading()).toMatchObject({ note: 'A', octave: 2 });
    expect(engine.reading()?.cents).toBeCloseTo(0, 0);
    expect(engine.listening()).toBe(true);
    engine.stop();
    expect(stopTrack).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(500);
    expect(engine.reading()).toBeNull();
  });

  it('stops a late microphone stream after closing a pending permission request', async () => {
    let resolve!: (value: typeof stream) => void;
    getUserMedia.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = engine.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(engine.requesting()).toBe(true);
    engine.stop();
    resolve(stream);
    await pending;
    expect(stopTrack).toHaveBeenCalledOnce();
    expect(engine.listening()).toBe(false);
    expect(engine.requesting()).toBe(false);
  });

  it('reports denied permissions and closes the audio context', async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException('Denied', 'NotAllowedError'));
    await engine.start();
    expect(engine.error()).toContain('permission was denied');
    expect(engine.listening()).toBe(false);
    expect(close).toHaveBeenCalled();
  });

  it('handles browsers without microphone support', async () => {
    vi.stubGlobal('navigator', {});
    await engine.start();
    expect(engine.error()).toContain('HTTPS or localhost');
  });
});
