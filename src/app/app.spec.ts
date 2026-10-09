import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { AudioPlayback } from './services/audio-playback';

/** Exercise component wiring with real state and silent, controllable audio. */
describe('App integration', () => {
  const audio = {
    selectedPitch: signal<number | null>(null),
    playing: signal(false),
    error: signal(''),
    stop: vi.fn(),
    playNote: vi.fn(),
    playMelody: vi.fn(),
    strum: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    audio.playing.set(false);
    audio.selectedPitch.set(null);
    TestBed.configureTestingModule({ providers: [{ provide: AudioPlayback, useValue: audio }] });
  });

  it('switches from a scale to chord fingering and updates the whole page for a new root', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.note-card')).toHaveLength(7);
    expect(element.querySelector('app-chord-shape-picker')).toBeNull();
    (element.querySelectorAll('.segmented button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.note-card')).toHaveLength(3);
    expect(element.querySelector('app-hand-position')).not.toBeNull();
    const root = element.querySelector('#root') as HTMLSelectElement;
    root.value = 'F';
    root.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.querySelector('#notes-title')?.textContent).toContain('F major');
    expect(element.querySelector('.hand-heading')?.textContent).toContain('F major');
    expect(element.querySelector('[data-finger="1"]')?.getAttribute('data-contact-y')).toBe('70');
  });

  it('updates formulas, note roles, and the selected grip for seventh and suspended chords', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    (element.querySelectorAll('.segmented button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    const family = element.querySelector('#scale') as HTMLSelectElement;
    family.value = 'maj7';
    family.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.querySelectorAll('.note-card')).toHaveLength(4);
    expect(element.querySelector('.formula')?.textContent).toContain('1 · 3 · 5 · 7');
    expect(element.querySelectorAll('.note-caption')[3].textContent).toContain('SEVENTH');
    expect(element.querySelector('.hand-heading')?.textContent).toContain('C major 7');
    family.value = 'sus4';
    family.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.querySelectorAll('.note-card')).toHaveLength(3);
    expect(element.querySelector('.formula')?.textContent).toContain('1 · 4 · 5');
    expect(element.querySelectorAll('.note-caption')[1].textContent).toContain('FOURTH');
  });

  it('wires scale playback and stop controls to the audio service', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'app-note-explorer .play-button',
    );
    button.click();
    expect(audio.playMelody).toHaveBeenCalledWith(expect.arrayContaining([{ pitch: 0, midi: 72 }]));
    audio.playing.set(true);
    fixture.detectChanges();
    button.click();
    expect(audio.stop).toHaveBeenCalled();
  });
});
