import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppUpdatesService } from './services/app-updates.service';
import { Dialog } from '@angular/cdk/dialog';
import { getBarColor, setBarColor, shadeColor } from './lib/utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
  ]
})
export class AppComponent {

  constructor(dialog: Dialog, updates: AppUpdatesService) {
    setBarColor("#fdfbff");
    dialog.afterOpened.subscribe(async (dialogRef) => {
      const barColor = getBarColor();
      setBarColor(shadeColor(barColor, -32));
      await firstValueFrom(dialogRef.closed);
      setBarColor(barColor);
    });
  }

}



