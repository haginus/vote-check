import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Election, Poll } from '../../../elections/types';

@Component({
  selector: 'app-form-create-dialog',
  templateUrl: './form-create-dialog.component.html',
  styleUrl: './form-create-dialog.component.scss'
})
export class FormCreateDialogComponent {

  elections = environment.currentElections;

  createForm = new FormGroup({
    election: new FormControl<Election>(this.elections[0], { validators: [Validators.required] }),
    poll: new FormControl<Poll>(this.elections[0].type.polls[0], { validators: [Validators.required] }),
  });

}
