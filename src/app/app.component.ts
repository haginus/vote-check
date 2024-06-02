import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { FormsService } from './services/forms.service';

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
  title = this.activeRoute.snapshot.params['title']
  showInfo = true

  constructor(private formsService: FormsService, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.title = this.activeRoute.snapshot.data['title'];
  }

}



