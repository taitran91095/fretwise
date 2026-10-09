import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundSelector } from './sound-selector';

describe('SoundSelector', () => {
  let fixture: ComponentFixture<SoundSelector>;
  let element: HTMLElement;
  beforeEach(() => {
    fixture = TestBed.createComponent(SoundSelector);
    fixture.componentRef.setInput('root', 'C');
    fixture.componentRef.setInput('scaleKey', 'major');
    fixture.componentRef.setInput('mode', 'scale');
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('offers four scale families and seven chord families', () => {
    expect(element.querySelectorAll('#scale option')).toHaveLength(4);
    fixture.componentRef.setInput('mode', 'chord');
    fixture.detectChanges();
    expect(
      Array.from(element.querySelectorAll('#scale option')).map((option) =>
        option.textContent?.trim(),
      ),
    ).toEqual([
      'Major',
      'Minor',
      'Major 7 (maj7)',
      'Minor 7 (m7)',
      'Dominant 7 (7)',
      'Suspended 2 (sus2)',
      'Suspended 4 (sus4)',
    ]);
  });

  it('emits a root value instead of a native DOM event', () => {
    const changed = vi.fn();
    fixture.componentInstance.rootChange.subscribe(changed);
    const select = element.querySelector('#root') as HTMLSelectElement;
    select.value = 'F';
    select.dispatchEvent(new Event('change'));
    expect(changed).toHaveBeenCalledWith('F');
  });
});
