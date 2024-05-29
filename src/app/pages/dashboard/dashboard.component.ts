import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormsService } from '../../services/forms.service';
import { SettingsComponent } from '../../components/settings/settings.component';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { FormCreateDialogComponent } from '../../components/form-create-dialog/form-create-dialog.component';
import { getElection } from '../../../elections/elections';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
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

