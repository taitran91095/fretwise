import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ChordDiagram } from './chord-diagram';
import { getChordShapes } from '../../domain/chord-shapes';

describe('ChordDiagram', () => {
  it('shows open and muted strings for an open chord', () => {
    const fixture = TestBed.createComponent(ChordDiagram);
    fixture.componentRef.setInput('shape', getChordShapes('C', false)[0]);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const statuses = Array.from(element.querySelectorAll('.diagram-status')).map((label) =>
      label.textContent?.trim(),
    );
    expect(statuses).toEqual(['×', '', '', '○', '', '○']);
    expect(element.querySelectorAll('.diagram-dot')).toHaveLength(3);
    expect(element.querySelector('.diagram-barre')).toBeNull();
  });

  it('draws a barre and labels the starting fret of a movable shape', () => {
    const fixture = TestBed.createComponent(ChordDiagram);
    fixture.componentRef.setInput(
      'shape',
      getChordShapes('C', false).find((shape) => shape.id === 'E'),
    );
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.diagram-barre')).not.toBeNull();
    expect(element.querySelector('.diagram-fret')?.textContent).toBe('8fr');
    expect(element.querySelector('svg')?.getAttribute('aria-label')).toContain(
      'Low E: fret 8, finger 1',
    );
  });
});
