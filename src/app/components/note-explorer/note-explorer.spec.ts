import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { NoteExplorer } from './note-explorer';
import { getNotes, SCALES } from '../../domain/music';

describe('NoteExplorer', () => {
  it('renders seven notes and emits the chosen note in the displayed scale octave', () => {
    const fixture = TestBed.createComponent(NoteExplorer);
    fixture.componentRef.setInput('name', 'B major');
    fixture.componentRef.setInput('notes', getNotes('B', 'major'));
    fixture.componentRef.setInput('scale', SCALES.major);
    fixture.componentRef.setInput('mode', 'scale');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const selected = vi.fn();
    fixture.componentInstance.noteSelected.subscribe(selected);
    const cards = element.querySelectorAll<HTMLButtonElement>('.note-card');
    expect(cards).toHaveLength(7);
    cards[1].click();
    expect(selected).toHaveBeenCalledWith({ pitch: 1, midi: 73 });
  });

  it('shows stop playback and reports audio errors accessibly', () => {
    const fixture = TestBed.createComponent(NoteExplorer);
    fixture.componentRef.setInput('name', 'C major');
    fixture.componentRef.setInput('notes', getNotes('C', 'major'));
    fixture.componentRef.setInput('scale', SCALES.major);
    fixture.componentRef.setInput('mode', 'scale');
    fixture.componentRef.setInput('playing', true);
    fixture.componentRef.setInput('audioError', 'Audio is unavailable');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.play-button')?.textContent).toContain('Stop playback');
    expect(element.querySelector('[role="alert"]')?.textContent).toBe('Audio is unavailable');
  });
});
