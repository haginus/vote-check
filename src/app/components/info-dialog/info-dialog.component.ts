import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
  ]
})
export class InfoDialogComponent {
  appVersion = environment.appVersion;
  electionName = environment.currentElections.map(election => election.type.name).join(', ');
  electionYear = environment.currentElections[0].date.getFullYear();
}
