import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Election, Poll } from '../../../elections/types';
import { getAvailablePolls } from '../../../elections/election-types';
import { SettingsService } from '../../services/settings.service';
import { BehaviorSubject, combineLatest, first, map, Observable, startWith, tap } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ElectionNamePipe } from '../../pipes/election-name.pipe';
import { elections, isElectionAvailable } from '../../../elections/elections';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

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
    MatIconModule,
    MatRippleModule,
    MatFormFieldModule,
    MatSelectModule,
    AsyncPipe,
    ElectionNamePipe,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    },
  ]
})
export class FormCreateDialogComponent {

  constructor() {
    this.elections$.pipe(first()).subscribe(elections => {
      this.electionControl.setValue(elections[0]);
    });
  }

  settingsService = inject(SettingsService);
  selectedPrecinct$ = this.settingsService.watchSettings().pipe(map(settings => settings.selectedPrecinct));

  showAllElections$ = new BehaviorSubject(false);
  elections$ = combineLatest([
    this.showAllElections$,
    this.selectedPrecinct$
  ]).pipe(
    map(([showAllElections, precinct]) => {
      return showAllElections
        ? elections.map(election => ({ ...election, isAvailable: isElectionAvailable(election, precinct) }))
        : environment.currentElections.filter(election => isElectionAvailable(election, precinct))
    })
  ) as Observable<(Election & { isAvailable?: boolean })[]>;

  createForm = new FormGroup({
    election: new FormControl<Election>(null, { validators: [Validators.required] }),
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
    this.selectedPrecinct$,
  ]).pipe(
    map(([election, selectedPrecinct]) => {
      if (!election) {
        return [];
      }
      return getAvailablePolls(election.type, selectedPrecinct);
    }),
    tap(polls => {
      this.pollControl.setValue(polls[0] || null);
    }),
  );

  compareElections(a: Election, b: Election) {
    return a?.id === b?.id;
  }

}
