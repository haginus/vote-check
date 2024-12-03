import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsService, PVForm } from '../../services/forms.service';
import { SettingsComponent } from '../../components/settings/settings.component';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { FormCreateDialogComponent } from '../../components/form-create-dialog/form-create-dialog.component';
import { getElection } from '../../../elections/elections';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TasksListComponent } from '../../tasks/tasks-list/tasks-list.component';
import { AsyncPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ElectionNamePipe } from '../../pipes/election-name.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, combineLatest, firstValueFrom, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { FormDeleteDialogComponent } from '../../components/form-delete-dialog/form-delete-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    TasksListComponent,
    AsyncPipe,
    DatePipe,
    ElectionNamePipe,
    NgTemplateOutlet,
  ],
})
export class DashboardComponent {

  constructor(
    private formsService: FormsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  showArchivedForms = false;
  forms$ = this.formsService.watchForms().pipe(
    map(forms => forms.filter(form => !form.isArchived))
  );
  archivedForms$ = this.formsService.watchForms().pipe(
    map(forms => forms.filter(form => form.isArchived))
  );
  archivedFormsCount$ = this.archivedForms$.pipe(
    map(forms => forms.length)
  );

  currentElection = environment.currentElections[0];

  createForm() {
    this.dialog.open(FormCreateDialogComponent);
  }

  openInfoDialog() {
    this.dialog.open(InfoDialogComponent);
  }

  openSettingsDialog() {
    this.dialog.open(SettingsComponent)
  }

  async toggleFormArchive(form: PVForm) {
    await firstValueFrom(this.formsService.editForm(form.id, { ...form, isArchived: !form.isArchived }));
    this.snackBar.open(`Proces-verbal ${form.isArchived ? 'dezarhivat' : 'arhivat'}.`);
    if(!await firstValueFrom(this.archivedFormsCount$)) {
      this.showArchivedForms = false;
    }
  }

  async deleteForm(form: PVForm) {
    if(!await firstValueFrom(this.dialog.open(FormDeleteDialogComponent).afterClosed())) return;
    await firstValueFrom(this.formsService.deleteForm(form.id));
    this.snackBar.open('Proces-verbal șters.');
  }

  getElection(id: string) {
    return getElection(id as any);
  }

}

