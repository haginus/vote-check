import { ApplicationRef, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { concat, firstValueFrom, interval, of } from 'rxjs';
import { first, map, timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AppUpdatesService {

  constructor(appRef: ApplicationRef, updates: SwUpdate, private snackBar: MatSnackBar) {
    if(!updates.isEnabled) return;
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everyThirtyMinutes$ = interval(30 * 60 * 1000);
    const everyThirtyMinutesOnceAppIsStable$ = concat(appIsStable$, everyThirtyMinutes$);

    everyThirtyMinutesOnceAppIsStable$.subscribe(async () => {
      try {
        const updateAvailable = await updates.checkForUpdate();
        if(updateAvailable && await this.promptUser()) {
          this.reloadApp();
        }
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  private promptUser() {
    const duration = 10000;
    const sbRef = this.snackBar.open(
      'O nouă versiune a aplicației este disponibilă',
      'Actualizați',
      { duration }
    );
    return firstValueFrom(
      sbRef.onAction().pipe(
        map(() => true),
        timeout({
          first: duration,
          with: () => of(false),
        }),
      )
    );
  }

  private reloadApp() {
    document.location.reload();
  }
}
