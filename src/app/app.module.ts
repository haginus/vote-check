import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule, SetupGuard } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MatTableModule } from '@angular/material/table';
import { FormEditComponent } from './pages/form-edit/form-edit.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { SettingsComponent } from './components/settings/settings.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SetupComponent } from './pages/setup/setup.component';
import { NamePipe } from './pipes/name.pipe';
import { TasksListComponent } from './tasks/tasks-list/tasks-list.component';
import { ProgressComponent } from './tasks/progress/progress.component';
import { TaskSectionComponent } from './tasks/task-section/task-section.component';
import { InfoDialogComponent } from './components/info-dialog/info-dialog.component';
import { FormExitDialogComponent } from './components/form-exit-dialog/form-exit-dialog.component';
import { FormDeleteDialogComponent } from './components/form-delete-dialog/form-delete-dialog.component';
import { FormSimpvDialogComponent } from './components/form-simpv-dialog/form-simpv-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FormEditComponent,
    InfoDialogComponent,
    FormExitDialogComponent,
    FormDeleteDialogComponent,
    FormSimpvDialogComponent,
    LoadingScreenComponent,
    SettingsComponent,
    SetupComponent,
    NamePipe,
    TasksListComponent,
    ProgressComponent,
    TaskSectionComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [SetupGuard, provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
