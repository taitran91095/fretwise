import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChordShapePicker } from './chord-shape-picker';
import { getChordShapes } from '../../domain/chord-shapes';

describe('ChordShapePicker', () => {
  let fixture: ComponentFixture<ChordShapePicker>;
  let element: HTMLElement;
  beforeEach(() => {
    fixture = TestBed.createComponent(ChordShapePicker);
    fixture.componentRef.setInput('name', 'C major');
    fixture.componentRef.setInput('shapes', getChordShapes('C', false));
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('groups the open shape separately from movable barre shapes', () => {
    const groups = element.querySelectorAll('.shape-group');
    expect(groups[0].querySelectorAll('.shape-card')).toHaveLength(1);
    expect(groups[1].querySelectorAll('.shape-card')).toHaveLength(5);
    expect(element.querySelectorAll('app-chord-diagram svg')).toHaveLength(6);
  });

  it('emits a selection and updates the hand when the parent supplies it', () => {
    const selected = vi.fn();
    fixture.componentInstance.shapeSelected.subscribe(selected);
    (element.querySelectorAll('.shape-card')[1] as HTMLButtonElement).click();
    expect(selected).toHaveBeenCalledWith(1);
    fixture.componentRef.setInput('selectedIndex', 1);
    fixture.detectChanges();
    expect(element.querySelector('.chosen')?.textContent).toContain('A-shape barre');
    expect(element.querySelector('app-hand-position')?.textContent).toContain('Barre fret 3');
  });

  it('removes the hand and strum controls when all chord notes are shown', () => {
    fixture.componentRef.setInput('selectedIndex', null);
    fixture.detectChanges();
    expect(element.querySelector('app-hand-position')).toBeNull();
    expect(element.querySelector('.shape-instruction')).toBeNull();
  });
});
