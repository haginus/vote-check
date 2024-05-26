import { Component, Inject, OnInit } from '@angular/core';
import { SimpvPullService } from '../../services/simpv-pull.service';
import { Settings, SettingsService } from '../../services/settings.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConnectionService } from 'ng-connection-service';
import { SettingsComponent } from '../settings/settings.component';
import { PVForm } from '../../services/forms.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-form-simpv-dialog',
  templateUrl: './form-simpv-dialog.component.html',
})
export class FormSimpvDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { form: PVForm },
    private simpv: SimpvPullService,
    private dialog: MatDialog,
    private connectionService: ConnectionService
  ) {}
  precinct: any = null;
  loading: boolean = true;
  online: boolean = navigator.onLine;

  ngOnInit() {
    this.connectionService
      .monitor()
      .subscribe(({ hasNetworkConnection: online }) => {
        if (online == true && !this.online) this.getPrecinctData();
        this.online = online;
      });
    this.getPrecinctData();
  }

  async getPrecinctData() {
    const { electionId, precinct } = this.data.form;
    this.loading = true;
    try {
      const data = await firstValueFrom(this.simpv.getPrecinct(electionId, precinct.number, precinct.county));
      this.precinct = data;
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async openSettings() {
    const dialogRef = this.dialog.open(SettingsComponent, {
      data: { form: this.data.form }
    });
    const settings = await firstValueFrom(dialogRef.afterClosed());
    if(!settings) return;
    const { selectedPrecinct: precinct } = settings as Settings;
    this.data.form.precinct = precinct;
    this.getPrecinctData();
  }
}
