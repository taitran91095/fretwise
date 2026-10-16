import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { routes } from './app.routes';
import { AudioPlayback } from './services/audio-playback';
import { ExplorerPage } from './pages/explorer-page/explorer-page';
import { RhythmPage } from './pages/rhythm-page/rhythm-page';

/** Exercise real routes, state, and component wiring with silent audio. */
describe('Practice page integration', () => {
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
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: AudioPlayback, useValue: audio }],
    });
  });

  it('redirects home and unknown URLs to scales', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', ExplorerPage);
    expect(harness.routeNativeElement?.querySelectorAll('.note-card')).toHaveLength(7);
    await harness.navigateByUrl('/unknown', ExplorerPage);
    expect(harness.routeNativeElement?.querySelector('app-chord-shape-picker')).toBeNull();
  });

  it('loads chords directly and updates the root, notes, and hand guide', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/chords', ExplorerPage);
    const element = harness.routeNativeElement!;
    expect(element.querySelectorAll('.note-card')).toHaveLength(3);
    expect(element.querySelector('app-hand-position')).not.toBeNull();
    expect(element.querySelector('.segmented')).toBeNull();
    const root = element.querySelector('#root') as HTMLSelectElement;
    root.value = 'F';
    root.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(element.querySelector('#notes-title')?.textContent).toContain('F major');
    expect(element.querySelector('.hand-heading')?.textContent).toContain('F major');
  });

  it('preserves scale and chord choices across navigation, and stops outgoing audio', async () => {
    const harness = await RouterTestingHarness.create();
    let page = await harness.navigateByUrl('/scales', ExplorerPage);
    page.explorer.setScale('minorPentatonic');
    page = await harness.navigateByUrl('/chords', ExplorerPage);
    page.explorer.setChord('maj7');
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelectorAll('.note-card')).toHaveLength(4);
    expect(harness.routeNativeElement?.querySelector('.formula')?.textContent).toContain(
      '1 · 3 · 5 · 7',
    );
    page = await harness.navigateByUrl('/scales', ExplorerPage);
    expect(page.explorer.scaleKey()).toBe('minorPentatonic');
    expect(harness.routeNativeElement!.querySelector<HTMLSelectElement>('#scale')!.value).toBe(
      'minorPentatonic',
    );
    expect(harness.routeNativeElement?.querySelectorAll('.note-card')).toHaveLength(5);
    page = await harness.navigateByUrl('/chords', ExplorerPage);
    expect(page.explorer.chordKey()).toBe('maj7');
    expect(harness.routeNativeElement!.querySelector<HTMLSelectElement>('#scale')!.value).toBe(
      'maj7',
    );
    audio.stop.mockClear();
    await harness.navigateByUrl('/strumming', RhythmPage);
    expect(audio.stop).toHaveBeenCalledOnce();
  });

  it('wires scale playback and stop controls to the audio service', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/scales', ExplorerPage);
    const button = harness.routeNativeElement!.querySelector<HTMLButtonElement>(
      'app-note-explorer .play-button',
    )!;
    button.click();
    expect(audio.playMelody).toHaveBeenCalledWith(expect.arrayContaining([{ pitch: 0, midi: 72 }]));
    audio.playing.set(true);
    harness.detectChanges();
    button.click();
    expect(audio.stop).toHaveBeenCalled();
  });

  it('shows all navigation links and keeps global practice tools available', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(
      Array.from(element.querySelectorAll('.page-nav a')).map((link) => link.textContent?.trim()),
    ).toEqual(['Scales', 'Chords', 'Strumming', 'Fingerpicking']);
    expect(element.querySelector('app-practice-tools')).not.toBeNull();
  });

  it('toggles navigation and closes it after choosing a page or pressing Escape', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const toggle = element.querySelector<HTMLButtonElement>('.menu-toggle')!;
    const nav = element.querySelector('nav')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    fixture.detectChanges();
    expect(nav.classList.contains('is-open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    element.querySelector<HTMLAnchorElement>('.page-nav a')!.click();
    fixture.detectChanges();
    expect(nav.classList.contains('is-open')).toBe(false);
    toggle.click();
    fixture.detectChanges();
    const restoreFocus = vi.spyOn(toggle, 'focus');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(restoreFocus).toHaveBeenCalledOnce();
  });

  it('selects Old Faithful and changes the count grid to three beats for a waltz', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/strumming', RhythmPage);
    const element = harness.routeNativeElement!;
    const options = element.querySelectorAll<HTMLButtonElement>('.pattern-option');
    expect(options).toHaveLength(51);
    Array.from(options)
      .find((button) => button.textContent?.includes('Old Faithful'))!
      .click();
    harness.detectChanges();
    expect(element.querySelector('#pattern-title')?.textContent).toBe('Old Faithful');
    expect(
      Array.from(element.querySelectorAll('.strum-notation td small')).map(
        (cell) => cell.textContent,
      ),
    ).toEqual(['D', '–', 'D', 'U', '–', 'U', 'D', 'U']);
    Array.from(options)
      .find((button) => button.textContent?.includes('Waltz strum'))!
      .click();
    harness.detectChanges();
    expect(element.querySelectorAll('.strum-notation thead th')).toHaveLength(6);
    expect(element.querySelector('.practice-plan')?.textContent).toContain('3 beats per bar');
  });

  it('filters styles and updates compound-meter and sixteenth-note guidance', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/strumming', RhythmPage);
    const element = harness.routeNativeElement!;
    const style = element.querySelector<HTMLSelectElement>('#rhythm-style')!;
    style.value = 'slow-rock';
    style.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(element.querySelectorAll('.pattern-option')).toHaveLength(4);
    expect(element.querySelector('.detail-heading')?.textContent).toContain('6/8');
    expect(element.querySelectorAll('.strum-notation thead th')).toHaveLength(6);
    expect(element.querySelector('.practice-plan')?.textContent).toContain('2 beats per bar');
    expect(element.querySelector('.source-notes')).toBeNull();
    style.value = 'funk';
    style.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(element.querySelectorAll('.strum-notation thead th')).toHaveLength(16);
    expect(element.querySelector('.meter-help')?.textContent).toContain('1-e-&-a');
    expect(element.querySelectorAll('.accent-count')).toHaveLength(2);
    expect(element.querySelector('.legend')?.textContent).toContain('Muted stroke');
  });

  it('searches English styles and recovers from an empty result', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/fingerpicking', RhythmPage);
    const element = harness.routeNativeElement!;
    const search = element.querySelector<HTMLInputElement>('#pattern-search')!;
    search.value = 'funk';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(element.querySelectorAll('.pattern-option')).toHaveLength(4);
    expect(element.querySelector('.style-context')?.textContent).toContain('Funk');
    expect(element.querySelector('.tab-notation')?.textContent).toContain('×');
    search.value = 'nonexistent-pattern';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(element.querySelector('.pattern-detail')).toBeNull();
    expect(element.querySelector('.empty-results')?.textContent).toContain('No matching patterns');
    element.querySelector<HTMLButtonElement>('.empty-results button')!.click();
    harness.detectChanges();
    expect(search.value).toBe('');
    expect(element.querySelectorAll('.pattern-option')).toHaveLength(51);
    expect(element.querySelector('#pattern-title')?.textContent).toBe('Forward arpeggio');
  });

  it('shows high-e-first C major tabs and simultaneous notes for a Travis pinch', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/fingerpicking', RhythmPage);
    const element = harness.routeNativeElement!;
    expect(element.querySelectorAll('.tab-notation tbody tr')).toHaveLength(6);
    expect(element.querySelector('.tab-notation tbody th')?.textContent?.trim()).toBe('e 1');
    expect(
      element
        .querySelectorAll('.tab-notation tbody tr')[4]
        .querySelector('td')
        ?.textContent?.trim(),
    ).toBe('3');
    Array.from(element.querySelectorAll<HTMLButtonElement>('.pattern-option'))
      .find((button) => button.textContent?.includes('Travis-style pinch'))!
      .click();
    harness.detectChanges();
    expect(element.querySelector('.tab-notation tfoot td')?.textContent?.trim()).toBe('p+m');
    expect(element.querySelectorAll('.tab-notation tbody td.played')).toHaveLength(9);
    await harness.navigateByUrl('/strumming', RhythmPage);
    expect(harness.routeNativeElement?.querySelector('.tab-notation')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('#pattern-title')?.textContent).toBe(
      'Steady downstrokes',
    );
  });
});
