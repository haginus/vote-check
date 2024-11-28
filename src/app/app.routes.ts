import { Routes } from '@angular/router';
import { FormResolver } from './resolvers/form.resolver';
import { setupGuard } from './guards/setup.guard';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [setupGuard]
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'form/:id/edit',
    loadComponent: () => import('./pages/form-edit/form-edit.component').then(m => m.FormEditComponent),
    canActivate: [setupGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: {
      formData: FormResolver,
    }
  },
  {
    path: 'form/create',
    loadComponent: () => import('./pages/form-edit/form-edit.component').then(m => m.FormEditComponent),
    canActivate: [setupGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: {
      formData: FormResolver,
    }
  },
  // {
  //   path: 'live-results',
  //   loadComponent: () => import('./pages/live-results/live-results.component').then(m => m.LiveResultsComponent),
  // },
  {
    path: '**',
    redirectTo: ''
  },
];
