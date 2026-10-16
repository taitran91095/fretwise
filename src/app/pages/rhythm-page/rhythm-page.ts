import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  C_MAJOR_FRETS,
  countPattern,
  FINGERPICKING_PATTERNS,
  getRhythmStyle,
  metronomeBeats,
  RHYTHM_STYLES,
  RhythmKind,
  RhythmStyleId,
  STRUMMING_PATTERNS,
  TAB_STRINGS,
} from '../../domain/rhythm-patterns';

@Component({
  selector: 'app-rhythm-page',
  imports: [RouterLink],
  templateUrl: './rhythm-page.html',
  styleUrl: './rhythm-page.css',
})
export class RhythmPage {
  readonly kind: RhythmKind =
    inject(ActivatedRoute).snapshot.data['kind'] === 'fingerpicking'
      ? 'fingerpicking'
      : 'strumming';
  readonly isPicking = this.kind === 'fingerpicking';
  readonly patterns = this.isPicking ? FINGERPICKING_PATTERNS : STRUMMING_PATTERNS;
  readonly styles = RHYTHM_STYLES;
  readonly styleFilter = signal<RhythmStyleId | 'all'>('all');
  readonly search = signal('');
  readonly selectedId = signal(this.patterns[0].id);
  readonly filtered = computed(() => {
    const query = this.normalize(this.search().trim());
    return this.patterns.filter((pattern) => {
      const style = getRhythmStyle(pattern.style);
      return (
        (this.styleFilter() === 'all' || pattern.style === this.styleFilter()) &&
        this.normalize(`${pattern.name} ${style.name} ${pattern.description}`).includes(query)
      );
    });
  });
  readonly groups = computed(() =>
    this.styles
      .map((style) => ({
        style,
        patterns: this.filtered().filter((pattern) => pattern.style === style.id),
      }))
      .filter((group) => group.patterns.length > 0),
  );
  readonly selected = computed(
    () =>
      this.filtered().find((pattern) => pattern.id === this.selectedId()) ??
      this.filtered()[0] ??
      this.patterns[0],
  );
  readonly selectedStyle = computed(() => getRhythmStyle(this.selected().style));
  readonly counts = computed(() => countPattern(this.selected()));
  readonly pulseCount = computed(() => metronomeBeats(this.selected()));
  readonly strings = TAB_STRINGS;

  setStyle(event: Event): void {
    this.styleFilter.set((event.target as HTMLSelectElement).value as RhythmStyleId | 'all');
    this.selectVisible();
  }

  setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.selectVisible();
  }

  clearFilters(): void {
    this.search.set('');
    this.styleFilter.set('all');
    this.selectedId.set(this.patterns[0].id);
  }

  strokeLabel(stroke: string): string {
    return (
      {
        D: 'Downstroke',
        U: 'Upstroke',
        B: 'Bass-only downstroke',
        X: 'Muted percussive stroke',
        '–': 'No new attack',
      } as Record<string, string>
    )[stroke];
  }

  strokeSymbol(stroke: string): string {
    return ({ D: '↓', U: '↑', B: '↓', X: '×', '–': '·' } as Record<string, string>)[stroke];
  }

  tabFret(stringIndex: number, step: number): string {
    if (this.selected().mutedSteps.includes(step)) return stringIndex === 2 ? '×' : '–';
    return this.selected().picks?.[step].some((pick) => pick.string === stringIndex + 1)
      ? String(C_MAJOR_FRETS[stringIndex])
      : '–';
  }

  fingersAt(step: number): string {
    if (this.selected().mutedSteps.includes(step)) return '×';
    return (
      this.selected()
        .picks?.[step].map((pick) => pick.finger)
        .join('+') || '–'
    );
  }

  private selectVisible(): void {
    if (!this.filtered().some((pattern) => pattern.id === this.selectedId()))
      this.selectedId.set(this.filtered()[0]?.id ?? '');
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase();
  }
}
