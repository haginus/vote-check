import { Component, OnInit } from '@angular/core';
import { SimpvPullService } from '../../services/simpv-pull.service';
import { FormsService } from '../../services/forms.service';
import { Settings, SettingsService } from '../../services/settings.service';
import { MatDialog } from '@angular/material/dialog';
import { ConnectionService } from 'ng-connection-service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-form-simpv-dialog',
  templateUrl: './form-simpv-dialog.component.html',
})
export class FormSimpvDialogComponent implements OnInit {
  constructor(
    private simpv: SimpvPullService,
    private formsService: FormsService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private connectionService: ConnectionService
  ) {}
  precinct: any = null;
  settings: Settings;
  loading: boolean = true;
  online: boolean = navigator.onLine;

  ngOnInit() {
    this.connectionService
      .monitor()
      .subscribe(({ hasInternetAccess: online }) => {
        if (online == true && !this.online) this.getPrecinctData();
        this.online = online;
      });
    this.settingsService.getSettings().subscribe((res) => {
      this.settings = res;
      if (this.online) this.getPrecinctData();
      else this.loading = false;
    });
  }

  getPrecinctData() {
    this.loading = true;
    this.simpv
      .getPrecinct(
        this.settings.selectedPrecinct.precinct,
        this.settings.selectedPrecinct.county
      )
      .subscribe((res) => {
        this.loading = false;
        this.precinct = res;
      });
  }
  openSettings() {
    const dialogRef = this.dialog.open(SettingsComponent);
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        this.loading = false;
        return;
      }
      this.loading = true;
      this.settingsService.getSettings().subscribe((res) => {
        if (res != this.settings) {
          this.settings = res;
          if (this.online) this.getPrecinctData();
          else {
            this.loading = false;
            this.precinct = null;
          }
        } else this.loading = false;
      });
    });
  }
}
