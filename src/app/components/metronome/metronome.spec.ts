import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Metronome } from './metronome';
import { MetronomeEngine } from '../../services/metronome-engine';

function setup() {
  TestBed.configureTestingModule({ providers: [MetronomeEngine] });
  const fixture = TestBed.createComponent(Metronome);
  fixture.detectChanges();
  return {
    fixture,
    element: fixture.nativeElement as HTMLElement,
    engine: TestBed.inject(MetronomeEngine),
  };
}

describe('Metronome controls', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the actual initial bar length and updates its beat indicators', () => {
    const { fixture, element, engine } = setup();
    const select = element.querySelector('select')!;
    expect(select.value).toBe('4');
    select.value = '3';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(engine.beatsPerBar()).toBe(3);
    expect(element.querySelectorAll('.beat-indicators span')).toHaveLength(3);
  });

  it('changes volume through its slider and shows when muted', () => {
    const { fixture, element, engine } = setup();
    const slider = element.querySelector('#metronome-volume') as HTMLInputElement;
    expect(slider.value).toBe('80');
    slider.value = '0';
    slider.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(engine.volume()).toBe(0);
    expect(element.querySelector('output')?.textContent?.trim()).toBe('Muted');
  });

  it('estimates tempo from evenly spaced taps and resets after a pause', () => {
    vi.useFakeTimers();
    const { fixture, engine } = setup();
    fixture.componentInstance.tapTempo();
    vi.advanceTimersByTime(500);
    fixture.componentInstance.tapTempo();
    vi.advanceTimersByTime(500);
    fixture.componentInstance.tapTempo();
    expect(engine.bpm()).toBe(120);
    vi.advanceTimersByTime(2500);
    fixture.componentInstance.tapTempo();
    vi.advanceTimersByTime(1000);
    fixture.componentInstance.tapTempo();
    expect(engine.bpm()).toBe(60);
  });
});
