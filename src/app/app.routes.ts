import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/pages/home-page/home-page.component').then(m => m.HomePageComponent) },
  { path: 'games/catch-trash', loadComponent: () => import('./features/catch-trash/pages/catch-trash-page/catch-trash-page.component').then(m => m.CatchTrashPageComponent) },
  { path: '**', redirectTo: '' },
];
