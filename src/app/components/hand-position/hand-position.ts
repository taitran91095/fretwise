import { Component, computed, input, signal } from '@angular/core';
import { ChordShape } from '../../domain/chord-shapes';
import { FINGERS, getFingerPlacements, contactX, stringNamesAtFret } from '../../domain/hand-pose';
import { STRING_INDEXES, DIAGRAM_FRET_LINES } from '../../domain/instrument';

@Component({
  selector: 'app-hand-position',
  templateUrl: './hand-position.html',
  styleUrl: './hand-position.css',
})
export class HandPosition {
  readonly shape = input.required<ChordShape>();
  readonly chordName = input.required<string>();
  readonly showHand = signal(true);
  readonly reversedView = signal(false);
  readonly handTransform = computed(() =>
    this.reversedView() ? 'translate(0 380) scale(1 -1)' : null,
  );
  readonly focusedFinger = signal<number | null>(null);
  readonly neckStrings = STRING_INDEXES;
  readonly neckFrets = DIAGRAM_FRET_LINES;
  readonly fingers = FINGERS;
  readonly placements = computed(() => getFingerPlacements(this.shape()));
  readonly openStrings = computed(() => stringNamesAtFret(this.shape(), 0));
  readonly mutedStrings = computed(() => stringNamesAtFret(this.shape(), -1));

  // Reflect geometry only; labels stay upright in both views.
  viewY(y: number): number {
    return this.reversedView() ? 380 - y : y;
  }

  contactX(stringIndex: number): number {
    return contactX(this.shape(), stringIndex);
  }

  focus(finger: number): void {
    this.focusedFinger.update((current) => (current === finger ? null : finger));
  }
}
