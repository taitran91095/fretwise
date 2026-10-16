import { Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PracticeTools } from './components/practice-tools/practice-tools';
import { PwaStatus } from './components/pwa-status/pwa-status';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, PracticeTools, PwaStatus],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '(document:keydown.escape)': 'closeMenu(true)' },
})
export class App {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly menuOpen = signal(false);

  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) {
      this.element.nativeElement.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
    }
  }

  focusPage(): void {
    this.closeMenu();
    this.element.nativeElement.querySelector<HTMLElement>('#page-content')?.focus();
  }
}
