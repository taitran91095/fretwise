import { Component, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

@Component({
  selector: 'app-pwa-status',
  templateUrl: './pwa-status.html',
  styleUrl: './pwa-status.css',
})
export class PwaStatus {
  readonly installPrompt = signal<InstallPromptEvent | null>(null);
  readonly updateReady = signal(false);
  readonly online = signal(navigator.onLine);
  readonly installError = signal('');

  constructor() {
    const updates = inject(SwUpdate, { optional: true });
    if (updates?.isEnabled) {
      updates.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
        if (event.type === 'VERSION_READY') this.updateReady.set(true);
      });
      updates.unrecoverable.pipe(takeUntilDestroyed()).subscribe(() => this.updateReady.set(true));
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  offerInstall(event: Event): void {
    if (!('prompt' in event) || typeof event.prompt !== 'function') return;
    event.preventDefault();
    this.installPrompt.set(event as InstallPromptEvent);
  }

  @HostListener('window:appinstalled')
  installed(): void {
    this.installPrompt.set(null);
    this.installError.set('');
  }

  @HostListener('window:online')
  wentOnline(): void {
    this.online.set(true);
  }

  @HostListener('window:offline')
  wentOffline(): void {
    this.online.set(false);
  }

  async install(): Promise<void> {
    const prompt = this.installPrompt();
    if (!prompt) return;
    this.installPrompt.set(null);
    try {
      await prompt.prompt();
    } catch {
      this.installError.set('Use your browser’s menu to install Fretwise.');
    }
  }

  reload(): void {
    // Reload rather than activating a worker in-place with potentially mismatched assets.
    window.location.reload();
  }
}
