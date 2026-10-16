import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Hash URLs also support direct links and refreshes on GitHub Pages.
    provideRouter(routes, withHashLocation()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:10000',
    }),
  ],
};
