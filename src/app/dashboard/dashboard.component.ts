import { Component, OnInit } from '@angular/core';
import { environment } from './../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { Form, FormsService } from '../forms.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  forms : Form[];
  constructor(private formsService: FormsService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.formsService.watchForms().subscribe(res => {
      this.forms = res;
    })
  }

  openInfoDialog() {
    this.dialog.open(DialogInfo);
  }

  openSettingsDialog() {
    this.dialog.open(SettingsComponent)
  }

}


// Dialog Info
@Component({
  selector: 'dialog-info',
  templateUrl: '../dialog-templates/dialog-info.html',
})
export class DialogInfo {
  appVersion : string = environment.appVersion
} 
