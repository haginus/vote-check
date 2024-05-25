import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
})
export class InfoDialogComponent {
  appVersion: string = environment.appVersion;
  electionName: string = environment.electionName;
}
