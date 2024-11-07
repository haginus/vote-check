import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsService } from '../../services/forms.service';
import { SettingsComponent } from '../../components/settings/settings.component';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { FormCreateDialogComponent } from '../../components/form-create-dialog/form-create-dialog.component';
import { getElection } from '../../../elections/elections';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TasksListComponent } from '../../tasks/tasks-list/tasks-list.component';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ElectionNamePipe } from '../../pipes/election-name.pipe';

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
    MatProgressSpinnerModule,
    TasksListComponent,
    AsyncPipe,
    DatePipe,
    ElectionNamePipe,
  ],
})
export class DashboardComponent {

  forms$ = this.formsService.watchForms();
  constructor(private formsService: FormsService, private dialog: MatDialog) { }

  createForm() {
    this.dialog.open(FormCreateDialogComponent);
  }

  openInfoDialog() {
    this.dialog.open(InfoDialogComponent);
  }

  openSettingsDialog() {
    this.dialog.open(SettingsComponent)
  }

  getElection(id: string) {
    return getElection(id as any);
  }

}

