import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PracticeTools } from './practice-tools';
import { MetronomeEngine } from '../../services/metronome-engine';
import { TunerEngine } from '../../services/tuner-engine';

function openTools() {
  const fixture = TestBed.createComponent(PracticeTools);
  fixture.detectChanges();
  const element: HTMLElement = fixture.nativeElement;
  (element.querySelector('.tools-launcher') as HTMLButtonElement).click();
  fixture.detectChanges();
  return { fixture, element };
}

describe('PracticeTools', () => {
  it('opens two menu choices and switches floating panels while cleaning up the old tool', () => {
    const { fixture, element } = openTools();
    expect(element.querySelectorAll('.tools-menu button')).toHaveLength(2);
    (element.querySelector('.tools-menu button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('app-metronome')).not.toBeNull();
    const stop = vi.spyOn(fixture.debugElement.injector.get(MetronomeEngine), 'stop');
    (element.querySelector('.tools-launcher') as HTMLButtonElement).click();
    fixture.detectChanges();
    (element.querySelectorAll('.tools-menu button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('app-tuner')).not.toBeNull();
    expect(element.querySelector('app-metronome')).toBeNull();
    expect(stop).toHaveBeenCalled();
    const tuner = fixture.debugElement.injector.get(TunerEngine);
    expect(tuner.listening()).toBe(false);
    const stopTuner = vi.spyOn(tuner, 'stop');
    (element.querySelector('.close-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('.tool-panel')).toBeNull();
    expect(stopTuner).toHaveBeenCalled();
  });

  it('dismisses the panel and menu with Escape', () => {
    const { fixture, element } = openTools();
    (element.querySelector('.tools-menu button') as HTMLButtonElement).click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(element.querySelector('.tool-panel')).toBeNull();
    expect(element.querySelector('.tools-menu')).toBeNull();
  });
});
