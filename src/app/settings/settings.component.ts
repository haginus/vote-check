import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConnectionService } from 'ng-connection-service';
import { Observable, of, scheduled } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormsService } from '../forms.service';
import { SimpvPullService } from '../simpv-pull.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private simpv : SimpvPullService, private forms : FormsService, private connectionService: ConnectionService) {
    this.filteredPrecincts = this.settingsForm.get('precinct').valueChanges
      .pipe(
        startWith(''),
        map(precinct => precinct ? this._filterPrecincts(precinct) : this.precincts.slice())
      );
  }

  settings = {county: null, precinct: null, uatName: null}
  online : boolean = navigator.onLine;
  disabled = true
  precincts = []
  filteredPrecincts : Observable<any>

  ngOnInit(): void {
    this.connectionService.monitor().subscribe(online => {
      if(online == true && !this.online) {
        this.getCountyPrecincts();
        this.precinct.enable();
      }
      this.online = online
    });
    this.forms.getSettings().subscribe(res => {
      this.settings = res ? res : {county: 'ct', precinct: null};
      this.settingsForm.get('county').setValue(this.settings.county);
      this.settingsForm.get('precinct').setValue(this.settings.precinct);
      if(this.online) this.getCountyPrecincts();
      else this.precinct.disable();
    })
    this.settingsForm.valueChanges.subscribe(e => {
      const val = Number(e.precinct)
      if(val > 0 && val <= this.precincts.length)
        this.disabled = false;
      else this.disabled = true;
    })
  }

  settingsForm = new FormGroup({
    'county': new FormControl('ct'),
    'precinct': new FormControl(null),
  });

  getCountyPrecincts() {
    this.simpv.getPrecincts(this.settings.county).subscribe(res => {
      res = res.map((precinct, precinctNo) => {
        return { name: precinct['precinct']['name'].toLowerCase(), uatName: precinct['uat']['name'].toLowerCase(), no: (precinctNo + 1).toString() }
      })
      this.precincts = res;
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

  get county() { return this.settingsForm.get("county") }
  get precinct() { return this.settingsForm.get("precinct") }

  saveSettings() {
    this.settings.county = this.settingsForm.get("county").value;
    this.settings.precinct = Number(this.settingsForm.get("precinct").value);
    this.settings.uatName = normalize(this.precincts[this.settings.precinct].uatName).toUpperCase();
    this.forms.saveSettings(this.settings)
  }

  
}

const normalize = (str: string) => {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
