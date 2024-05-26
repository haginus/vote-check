import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormEditComponent } from './pages/form-edit/form-edit.component';
import { SetupComponent } from './pages/setup/setup.component';
import { FormResolver } from './resolvers/form.resolver';
import { setupGuard } from './guards/setup.guard';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [setupGuard] },
  { path: 'setup', component: SetupComponent },
  {
    path: 'form/:id/edit',
    component: FormEditComponent,
    canActivate: [setupGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: {
      formData: FormResolver,
    }
  },
  {
    path: 'form/create',
    component: FormEditComponent,
    canActivate: [setupGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: {
      formData: FormResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


