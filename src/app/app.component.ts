import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Form, FormsService } from './forms.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = this.activeRoute.snapshot.params['title']
  showInfo = true
  
  constructor(private formsService: FormsService, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.title = this.activeRoute.snapshot.data['title'];
  }
  
}



