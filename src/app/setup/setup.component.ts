import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit, AfterViewInit, OnDestroy {

  public online: boolean = navigator.onLine;

  constructor(private dialog: MatDialog, private router: Router, private connectionService: ConnectionService) { }
  ngOnInit(): void {
    this.connectionService.monitor().subscribe(online => this.online = online);
  }

  ngAfterViewInit() {
    document.getElementsByTagName("body")[0].style.backgroundColor = "#2196F3"; // iOS fallback
  }

  ngOnDestroy() {
    document.getElementsByTagName("body")[0].style.backgroundColor = "white";
  }

  openSettings() {
    const dialogRef = this.dialog.open(SettingsComponent)
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.router.navigate([''])
      }
    })
  }

}
