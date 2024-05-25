import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PVForm, FormsService } from '../../services/forms.service';
import { SettingsComponent } from '../../components/settings/settings.component';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  forms : PVForm[];
  constructor(private formsService: FormsService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.formsService.watchForms().subscribe(res => {
      this.forms = res;
    })
  }

  openInfoDialog() {
    this.dialog.open(InfoDialogComponent);
  }

  openSettingsDialog() {
    this.dialog.open(SettingsComponent)
  }

}

