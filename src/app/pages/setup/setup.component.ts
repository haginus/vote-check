import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';
import { SettingsComponent } from '../../components/settings/settings.component';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    AsyncPipe,
  ]
})
export class SetupComponent implements AfterViewInit, OnDestroy {

  public hasNetworkConnection$: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private connectionService: ConnectionService
  ) {
    this.hasNetworkConnection$ = this.connectionService.monitor().pipe(
      takeUntilDestroyed(),
      map((res) => res.hasNetworkConnection)
    );
  }

  ngAfterViewInit() {
    document.getElementsByTagName("body")[0].style.backgroundColor = "#2196F3"; // iOS fallback
  }

  ngOnDestroy() {
    document.getElementsByTagName("body")[0].style.backgroundColor = "white";
  }

  openSettings() {
    const dialogRef = this.dialog.open(SettingsComponent);
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.router.navigate([''])
      }
    });
  }

}
