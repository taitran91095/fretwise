import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { HandPosition } from './hand-position';
import { getChordShapes } from '../../domain/chord-shapes';

describe('HandPosition', () => {
  let fixture: ComponentFixture<HandPosition>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HandPosition);
    fixture.componentRef.setInput('shape', getChordShapes('C', false)[0]);
    fixture.componentRef.setInput('chordName', 'C major');
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renders a left hand on the neck with the three C major contact points', () => {
    expect(element.querySelector('svg')?.getAttribute('aria-label')).toContain(
      'Left hand holding the neck for C major',
    );
    expect(element.querySelectorAll('.posed-finger')).toHaveLength(4);
    expect(element.querySelectorAll('.contact-dot')).toHaveLength(3);
    expect(element.textContent).toContain('B string · fret 1');
    expect(element.textContent).toContain('Not needed for this shape');
  });

  it('hides the hand while preserving all contact points', () => {
    (element.querySelector('.pose-toolbar button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.posed-finger')).toHaveLength(0);
    expect(element.querySelectorAll('.contact-dot')).toHaveLength(3);
    expect(element.querySelector('.pose-toolbar button')?.textContent?.trim()).toBe('Show hand');
  });

  it('updates the grip when a barre shape is selected', () => {
    fixture.componentRef.setInput(
      'shape',
      getChordShapes('F', true).find((shape) => shape.id === 'E'),
    );
    fixture.componentRef.setInput('chordName', 'F minor');
    fixture.detectChanges();
    expect(element.querySelectorAll('.contact-dot')).toHaveLength(6);
    expect(element.textContent).toContain('Barre fret 1 · Low E to High e');
    expect(element.querySelector('[data-finger="1"]')?.getAttribute('data-contact-y')).toBe('70');
  });

  it('highlights and unhighlights a finger through its instruction button', () => {
    const button = element.querySelector('.finger-step') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(element.querySelector('[data-finger="1"]')?.classList.contains('emphasized')).toBe(true);
    button.click();
    fixture.detectChanges();
    expect(element.querySelector('.emphasized')).toBeNull();
  });
});
