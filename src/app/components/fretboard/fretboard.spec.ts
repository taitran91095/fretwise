import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Fretboard } from './fretboard';
import { getNotes } from '../../domain/music';
import { getChordShapes } from '../../domain/chord-shapes';

describe('Fretboard', () => {
  let fixture: ComponentFixture<Fretboard>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(Fretboard);
    fixture.componentRef.setInput('notes', getNotes('C', 'major', true));
    fixture.componentRef.setInput('mode', 'chord');
    fixture.componentRef.setInput('activeShape', getChordShapes('C', false)[0]);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('maps low-E-first fingering data to the high-e-first fretboard', () => {
    const positions = Array.from(element.querySelectorAll('.shape-position-note'));
    expect(positions).toHaveLength(5); // Three fingers plus two open strings.
    expect(
      element.querySelector('[aria-label="C, fret 3, string A, finger 3"]')?.textContent?.trim(),
    ).toBe('3');
    expect(
      element.querySelector('[aria-label="E, fret 2, string D, finger 2"]')?.textContent?.trim(),
    ).toBe('2');
    expect(
      element.querySelector('[aria-label="C, fret 1, string B, finger 1"]')?.textContent?.trim(),
    ).toBe('1');
  });

  it('emits the clicked string pitch and octave for playback', () => {
    const selected = vi.fn();
    fixture.componentInstance.noteSelected.subscribe(selected);
    (
      element.querySelector('[aria-label="C, fret 3, string A, finger 3"]') as HTMLButtonElement
    ).click();
    expect(selected).toHaveBeenCalledWith({ pitch: 0, midi: 48 });
  });

  it('shows degrees without overwriting the selected shape finger numbers', () => {
    fixture.componentRef.setInput('showDegrees', true);
    fixture.detectChanges();
    expect(element.querySelector('[aria-label="E, fret 12, string e"]')?.textContent?.trim()).toBe(
      '3',
    );
    expect(
      element.querySelector('[aria-label="C, fret 3, string A, finger 3"]')?.textContent?.trim(),
    ).toBe('3');
  });

  it('clears shape markers while retaining all chord notes', () => {
    const noteCount = element.querySelectorAll('.fret-note').length;
    fixture.componentRef.setInput('activeShape', undefined);
    fixture.detectChanges();
    expect(element.querySelectorAll('.shape-position-note')).toHaveLength(0);
    expect(element.querySelectorAll('.fret-note')).toHaveLength(noteCount);
  });

  it('requests a degree toggle without mutating its input', () => {
    const changed = vi.fn();
    fixture.componentInstance.degreesChange.subscribe(changed);
    (element.querySelector('.degree-toggle') as HTMLButtonElement).click();
    expect(changed).toHaveBeenCalledWith(true);
    expect(fixture.componentInstance.showDegrees()).toBe(false);
  });
});
