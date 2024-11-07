import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';
import { ElectionNamePipe } from '../../pipes/election-name.pipe';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    ElectionNamePipe,
  ]
})
export class InfoDialogComponent {
  appVersion = environment.appVersion;
  elections = environment.currentElections;
}
