import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConnectionService } from 'ng-connection-service';
import { Observable, combineLatest, firstValueFrom, of } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { PVForm } from '../../services/forms.service';
import {
  SettingsService,
  Settings,
  defaultSettings,
} from '../../services/settings.service';
import { SimpvPullService } from '../../services/simpv-pull.service';
import COUNTIES from '../../../files/counties.json';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { Precint } from '../../../elections/types';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: SettingsDialogData | undefined,
    private readonly dialogRef: MatDialogRef<SettingsComponent>,
    private readonly simpv: SimpvPullService,
    private readonly connectionService: ConnectionService,
    private readonly settingsService: SettingsService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.filteredPrecincts = combineLatest([
      this.precinctSearch.valueChanges.pipe(startWith('')),
      this.precincts$,
    ]).pipe(
      takeUntilDestroyed(),
      map(([precinctSearch, precincts]) => {
        const filtered = precinctSearch ? this._filterPrecincts(precinctSearch, precincts) : precincts;
        const precinct = filtered.find(precinct => precinct.number == +precinctSearch);
        if(precinct) {
          this.precinct.setValue(precinct);
        }
        return filtered;
      }),
    );
  }

  electionId = this.data?.form.electionId || environment.currentElections[0].id;
  settings: Settings;
  online: boolean = navigator.onLine;
  loadingPrecincts = false;
  counties = [];
  filteredPrecincts: Observable<any>;

  settingsForm = new FormGroup({
    county: new FormControl<string>(null, { validators: [Validators.required] }),
    precinct: new FormControl<Precint>(null, { validators: [Validators.required] }),
    precinctSearch: new FormControl<string>(null),
  });

  get county() {
    return this.settingsForm.get('county');
  }

  get precinct() {
    return this.settingsForm.get('precinct');
  }

  get precinctSearch() {
    return this.settingsForm.get('precinctSearch');
  }

  precincts$ = this.county.valueChanges.pipe(
    tap(() => {
      this.loadingPrecincts = true;
      this.precinctSearch.disable();
    }),
    switchMap((county) => county ? this.simpv.getPrecincts(this.electionId, county) : of([])),
    map(result => result.map((precinct, precinctNo) => ({
      name: precinct['precinct']['name'].toLowerCase(),
      uatName: precinct['uat']['name'].toLowerCase(),
      number: (precinctNo + 1),
    }))),
    tap(precincts => {
      if(this.precinct.value?.county !== this.county.value) {
        this.precinctSearch.setValue(null);
        this.precinct.setValue(null);
      }
      this.precinctSearch.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(precincts.length)
      ]);
      this.loadingPrecincts = false;
      this.precinctSearch.enable();
      if(precincts.length === 0) {
        this.precinctSearch.disable();
        this.precinct.setValue(null);
      }
    }),
    catchError((e) => {
      console.error(e);
      this.loadingPrecincts = false;
      this.precinct.setValue(null);
      return [];
    }),
  );

  async ngOnInit() {
    let counties = COUNTIES;
    this.counties = Object.entries(counties);

    if(this.data?.form) {
      this.electionId = this.data.form.electionId;
      this.settings = {
        selectedPrecinct: this.data.form.precinct,
      };
    } else {
      const settings = await firstValueFrom(this.settingsService.getSettings());
      this.settings = settings || defaultSettings;
    }

    setTimeout(() => {
      this.county.setValue(this.settings.selectedPrecinct.county);
      this.precinct.setValue(this.settings.selectedPrecinct);
      this.precinctSearch.setValue((this.settings.selectedPrecinct.number || '') + '');
    }, 100);
  }

  _filterPrecincts(value: string, precincts: any[]) {
    const filterValue = normalize(value.toString());

    return precincts.filter(
      (precinct) =>
        normalize(precinct.number.toString()).indexOf(filterValue) === 0 ||
        normalize(precinct.name).includes(filterValue) ||
        normalize(precinct.uatName).includes(filterValue)
    );
  }

  async saveSettings() {
    const precinct = this.precinct.value;
    this.settings.selectedPrecinct = {
      county: this.county.value,
      uatName: precinct.uatName.toLocaleUpperCase(),
      number: precinct.number,
    };
    try {
      if(!this.data?.form) {
        await firstValueFrom(this.settingsService.saveSettings(this.settings));
      }
      this.dialogRef.close(this.settings);
      this.snackBar.open('Setările au fost salvate.');
    } catch (e) {
      console.error(e);
    }
  }
}

interface SettingsDialogData {
  form?: PVForm;
}

const normalize = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};
