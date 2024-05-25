import { Injectable, NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormEditComponent } from './pages/form-edit/form-edit.component';
import { FormsService } from './services/forms.service';
import { SettingsService } from './services/settings.service';
import { SetupComponent } from './pages/setup/setup.component';
import { FormResolver } from './resolvers/form.resolver';

@Injectable()
export class SetupGuard implements CanActivate {
    constructor(private formsService: FormsService, private settingsService: SettingsService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.settingsService.getSettings().pipe(
          map(e => {
            if (e) {
              return true;
            } else {
              this.router.navigate(['/setup']);
              return false;
            }
          }),
          catchError((err) => {
            this.router.navigate(['/setup']);
            return of(false);
          })
        );
    }
}

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [SetupGuard] },
  { path: 'setup', component: SetupComponent },
  //{ path: 'form/:id/view', component: FormViewComponent, data: {title: 'Vizionare PV'} },
  {
    path: 'form/:id/edit',
    component: FormEditComponent,
    canActivate: [SetupGuard],
    resolve: {
      form: FormResolver,
    }
  },
  { path: 'form/create', component: FormEditComponent, canActivate: [SetupGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


