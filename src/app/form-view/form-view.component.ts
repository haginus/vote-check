import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Form, FormsService } from '../forms.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss']
})
export class FormViewComponent implements OnInit {
  form : Form
  formId : any
  constructor(private formsService : FormsService, private route: ActivatedRoute, private router: Router) { }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.formId = +params['id'];
      this.formsService.getForms().subscribe(res => {
        if(this.formId >= 0 && this.formId < res.length)
          this.form = res[this.formId]
        else this.router.navigate(['']);
      })
    });
    
  }


}
