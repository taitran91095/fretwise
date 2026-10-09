import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { PwaStatus } from './pwa-status';

function setup() {
  const versionUpdates = new Subject<{ type: string }>();
  const unrecoverable = new Subject<void>();
  TestBed.configureTestingModule({
    providers: [
      { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates, unrecoverable } },
    ],
  });
  const fixture = TestBed.createComponent(PwaStatus);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement, versionUpdates };
}

describe('PWA status', () => {
  it('offers installation after the browser event and prompts only on a click', async () => {
    const { fixture, element } = setup();
    const event = new Event('beforeinstallprompt', { cancelable: true });
    const prompt = vi.fn().mockResolvedValue(undefined);
    Object.assign(event, { prompt });
    window.dispatchEvent(event);
    fixture.detectChanges();
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    (element.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(prompt).toHaveBeenCalledOnce();
    expect(element.querySelector('button')).toBeNull();
  });

  it('offers a reload only after a complete new version is ready', () => {
    const { fixture, element, versionUpdates } = setup();
    versionUpdates.next({ type: 'VERSION_DETECTED' });
    fixture.detectChanges();
    expect(element.querySelector('button')).toBeNull();
    versionUpdates.next({ type: 'VERSION_READY' });
    fixture.detectChanges();
    expect(element.querySelector('button')?.textContent).toContain('Reload to update');
  });

  it('updates the offline status and removes it when connectivity returns', () => {
    const { fixture, element } = setup();
    window.dispatchEvent(new Event('offline'));
    fixture.detectChanges();
    expect(element.textContent).toContain('Offline');
    window.dispatchEvent(new Event('online'));
    fixture.detectChanges();
    expect(element.querySelector('.offline-note')).toBeNull();
  });
});
