import { Injectable, NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormEditComponent } from './form-edit/form-edit.component';
import { FormViewComponent } from './form-view/form-view.component';
import { FormsService } from './forms.service';
import { SettingsService } from './settings.service';
import { SetupComponent } from './setup/setup.component';

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
  { path: 'form/:id/edit', component: FormEditComponent, canActivate: [SetupGuard] },
  { path: 'form/create', component: FormEditComponent, canActivate: [SetupGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


