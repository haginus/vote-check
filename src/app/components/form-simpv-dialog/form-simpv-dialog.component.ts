import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SimpvPullService } from '../../services/simpv-pull.service';
import { Settings } from '../../services/settings.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConnectionService } from 'ng-connection-service';
import { SettingsComponent } from '../settings/settings.component';
import { PVForm } from '../../services/forms.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-form-simpv-dialog',
  templateUrl: './form-simpv-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
    TitleCasePipe,
  ]
})
export class FormSimpvDialogComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { form: PVForm },
    private simpv: SimpvPullService,
    private dialog: MatDialog,
    private connectionService: ConnectionService
  ) {}
  precinct: any = null;
  loading: boolean = true;
  isOnline: boolean = navigator.onLine;
  onlineSubscription!: Subscription;

  ngOnInit() {
    this.onlineSubscription = this.connectionService.monitor().subscribe(({ hasNetworkConnection }) => {
      if (hasNetworkConnection == true && !this.isOnline) {
        this.getPrecinctData();
      }
      this.isOnline = hasNetworkConnection;
    });
    this.getPrecinctData();
  }

  ngOnDestroy() {
    this.onlineSubscription.unsubscribe();
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
