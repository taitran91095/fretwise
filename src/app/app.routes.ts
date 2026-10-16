import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'scales' },
  {
    path: 'scales',
    title: 'Scales · Fretwise',
    data: { mode: 'scale' },
    loadComponent: () => import('./pages/explorer-page/explorer-page').then((m) => m.ExplorerPage),
  },
  {
    path: 'chords',
    title: 'Chords · Fretwise',
    data: { mode: 'chord' },
    loadComponent: () => import('./pages/explorer-page/explorer-page').then((m) => m.ExplorerPage),
  },
  {
    path: 'strumming',
    title: 'Strumming patterns · Fretwise',
    data: { kind: 'strumming' },
    loadComponent: () => import('./pages/rhythm-page/rhythm-page').then((m) => m.RhythmPage),
  },
  {
    path: 'fingerpicking',
    title: 'Fingerpicking patterns · Fretwise',
    data: { kind: 'fingerpicking' },
    loadComponent: () => import('./pages/rhythm-page/rhythm-page').then((m) => m.RhythmPage),
  },
  { path: '**', redirectTo: 'scales' },
];
