import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Tuner } from './tuner';
import { TunerEngine } from '../../services/tuner-engine';

function setup() {
  TestBed.configureTestingModule({ providers: [TunerEngine] });
  const engine = TestBed.inject(TunerEngine);
  engine.targetMidi.set(40);
  const fixture = TestBed.createComponent(Tuner);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement, engine };
}

describe('Tuner controls', () => {
  it('preserves the selected guitar string when opened and shows cents for it', () => {
    const { fixture, element, engine } = setup();
    expect(element.querySelector('select')?.value).toBe('40');
    const lowE = 440 * 2 ** ((40 - 69) / 12);
    engine.frequency.set(lowE * 2 ** (20 / 1200));
    fixture.detectChanges();
    expect(element.querySelector('.pitch-status')?.textContent).toContain('Too high');
    expect(element.querySelector('.frequency')?.textContent).toContain('+20 cents');
    engine.frequency.set(lowE);
    fixture.detectChanges();
    expect(element.querySelector('.pitch-status')?.textContent).toBe('In tune');
  });

  it('switches back to automatic detection and clears the old reading', () => {
    const { fixture, element, engine } = setup();
    engine.frequency.set(110);
    const select = element.querySelector('select')!;
    select.value = 'auto';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(engine.targetMidi()).toBeUndefined();
    expect(engine.reading()).toBeNull();
    expect(engine.listening()).toBe(false);
  });
});
