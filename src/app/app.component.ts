import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AppUpdatesService } from './services/app-updates.service';

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
  title = this.activeRoute.snapshot.params['title'];
  showInfo = true;

  constructor(private activeRoute: ActivatedRoute, updates: AppUpdatesService) { }

  ngOnInit() {
    this.title = this.activeRoute.snapshot.data['title'];
  }

}



