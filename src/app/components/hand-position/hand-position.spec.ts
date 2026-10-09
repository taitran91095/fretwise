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
    (element.querySelector('.hand-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.posed-finger')).toHaveLength(0);
    expect(element.querySelectorAll('.contact-dot')).toHaveLength(3);
    expect(element.querySelector('.hand-toggle')?.textContent?.trim()).toBe('Show hand');
  });

  it('reverses string order and hand geometry while keeping labels upright', () => {
    const toggle = element.querySelector('.view-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    const labels = [...element.querySelectorAll('.neck-string-label')];
    const lowE = labels[0];
    const highE = labels[5];
    expect(Number(highE.getAttribute('y'))).toBeLessThan(Number(lowE.getAttribute('y')));
    expect(element.querySelector('.hand-geometry')?.getAttribute('transform')).toBe(
      'translate(0 380) scale(1 -1)',
    );
    expect(element.querySelector('.finger-number')?.getAttribute('transform')).toBeNull();
    expect(element.querySelector('[data-finger="1"]')?.getAttribute('data-contact-y')).toBe('214');
    expect(element.querySelector('svg')?.getAttribute('aria-label')).toContain('Player’s view');
    toggle.click();
    fixture.detectChanges();
    expect(element.querySelector('.hand-geometry')?.getAttribute('transform')).toBeNull();
    expect(element.querySelector('[data-finger="1"]')?.getAttribute('data-contact-y')).toBe('166');
  });

  it('keeps the reversed view when changing shapes or hiding the hand', () => {
    (element.querySelector('.view-toggle') as HTMLButtonElement).click();
    fixture.componentRef.setInput(
      'shape',
      getChordShapes('E', false).find((shape) => shape.id === 'C'),
    );
    fixture.detectChanges();
    expect(element.querySelector('[data-finger="1"]')?.getAttribute('data-contact-y')).toBe('238');
    expect(element.querySelectorAll('.contact-dot')).toHaveLength(5);
    (element.querySelector('.hand-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('.hand-geometry')).toBeNull();
    expect(element.querySelectorAll('.contact-dot')).toHaveLength(5);
    expect(element.querySelector('.view-toggle')?.getAttribute('aria-pressed')).toBe('true');
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
