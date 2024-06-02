import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Election, Poll } from '../../../elections/types';
import { getAvailablePolls } from '../../../elections/election-types';
import { SettingsService } from '../../services/settings.service';
import { combineLatest, map, startWith, tap } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-form-create-dialog',
  templateUrl: './form-create-dialog.component.html',
  styleUrl: './form-create-dialog.component.scss',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    AsyncPipe,
    DatePipe,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    },
  ]
})
export class FormCreateDialogComponent {

  settingsService = inject(SettingsService);
  elections = environment.currentElections;

  createForm = new FormGroup({
    election: new FormControl<Election>(this.elections[0], { validators: [Validators.required] }),
    poll: new FormControl<Poll>(null, { validators: [Validators.required] }),
  });

  get electionControl() {
    return this.createForm.get('election')!;
  }

  get pollControl() {
    return this.createForm.get('poll')!;
  }

  polls$ = combineLatest([
    this.electionControl.valueChanges.pipe(startWith(this.electionControl.value)),
    this.settingsService.getSettings()
  ]).pipe(
    map(([election, settings]) => {
      if (!election) {
        return [];
      }
      return getAvailablePolls(election.type, settings.selectedPrecinct);
    }),
    tap(polls => {
      this.pollControl.setValue(polls[0] || null);
    }),
  );

}
