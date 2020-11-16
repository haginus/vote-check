import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private storage: StorageMap) { }

  getSettings() : Observable<Settings> {
    return this.storage.get("settings");
  }

  watchSettings() : Observable<Settings> {
    return this.storage.watch("settings");
  }

  saveSettings(settings : any) {
    this.storage.set("settings", settings).subscribe(() => {});
  }
}

export interface Settings {
  county?: string,
  precinct?: number,
  uatName?: string
}
