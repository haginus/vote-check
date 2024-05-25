import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConnectionService } from 'ng-connection-service';
import { Observable, of, scheduled } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormsService } from '../forms.service';
import { SettingsService, Settings, defaultSettings } from '../settings.service';
import { SimpvPullService } from '../simpv-pull.service';
import COUNTIES from '../../files/counties.json'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private simpv: SimpvPullService, private forms: FormsService, private connectionService: ConnectionService, private settingsService: SettingsService) {
    this.filteredPrecincts = this.settingsForm.get('precinct').valueChanges
      .pipe(
        startWith(''),
        map(precinct => precinct ? this._filterPrecincts(precinct) : this.precincts.slice())
      );
  }

  settings : Settings;
  online : boolean = navigator.onLine;
  disabled = true
  counties = []
  precincts = []
  filteredPrecincts : Observable<any>

  settingsForm = new FormGroup({
    'county': new FormControl(null),
    'precinct': new FormControl({value: null, disabled: true}),
  });

  get county() { return this.settingsForm.get("county") }
  get precinct() { return this.settingsForm.get("precinct") }

  ngOnInit(): void {
    let counties = COUNTIES
    this.counties = Object.entries(counties);

    this.connectionService.monitor().subscribe(({ hasInternetAccess: online }) => {
      if(online == true && !this.online) {
        this.getCountyPrecincts();
      }
      if(online) {
        this.county.enable();
        this.precinct.enable();
      }
      this.online = online
    });

    this.settingsService.getSettings().subscribe(res => {
      if(res == undefined) {
        this.settings = defaultSettings;
      } else {
        this.settings = res;
        this.county.setValue(this.settings.selectedPrecinct.county);
        this.precinct.setValue(this.settings.selectedPrecinct.precinct);
        if(this.online)
          this.getCountyPrecincts();
        else {
          this.county.disable();
          this.precinct.disable();
        }
      }
    })

    this.county.valueChanges.subscribe(value => {
      if(this.settings.selectedPrecinct.county != value || value == null) {
        this.settings.selectedPrecinct.county = value;
        this.getCountyPrecincts();
        this.settings.selectedPrecinct.precinct = null;
        this.precinct.setValue(null);
      }
    })

    this.precinct.valueChanges.subscribe(value => {
      const val = Number(value)
      if(val > 0 && val <= this.precincts.length)
        this.disabled = false;
      else this.disabled = true;
    })
  }



  getCountyPrecincts() {
    if(!this.settings.selectedPrecinct.county)
      return;
    this.precinct.disable();
    this.simpv.getPrecincts(this.settings.selectedPrecinct.county).subscribe(res => {
      res = res.map((precinct, precinctNo) => {
        return { name: precinct['precinct']['name'].toLowerCase(), uatName: precinct['uat']['name'].toLowerCase(), no: (precinctNo + 1).toString() }
      })
      this.precincts = res;
      this.precinct.setValue(this.settings.selectedPrecinct.precinct);
      this.precinct.enable();
    });
  }

  _filterPrecincts(value : string) {

    const filterValue = normalize(value.toString());

    return this.precincts.filter(precinct =>
      normalize(precinct.no).indexOf(filterValue) === 0 ||
      normalize(precinct.name).includes(filterValue) ||
      normalize(precinct.uatName).includes(filterValue )
    );
  }

  saveSettings() {
    this.settings.selectedPrecinct.county = this.county.value;
    this.settings.selectedPrecinct.precinct = Number(this.precinct.value);
    this.settings.selectedPrecinct.uatName = normalize(this.precincts[this.settings.selectedPrecinct.precinct].uatName).toUpperCase();
    this.settingsService.saveSettings(this.settings).subscribe(_ => {})
  }


}

const normalize = (str: string) => {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
