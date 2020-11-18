import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { JSONSchema } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private storage: StorageMap) { }

  getSettings() : Observable<Settings> {
    return this.storage.get<Settings>("settings", schema)
    .pipe(
      tap(settings => {
        if(settings == undefined)
          throw 'settingsUndefined'
        if(settings.electionType != environment.electionType)
          throw 'electionType'
      }),
      catchError(this.handleError('getSettings'))
    );
  }

  watchSettings() : Observable<Settings> {
    return this.storage.watch<Settings>("settings", schema).pipe(
      catchError(this.handleError('watchSettings'))
    );
  }

  saveSettings(settings : Settings) {
    return this.storage.set("settings", settings, schema).pipe(
      map(_ => settings)
    );
  }

  private clearDatabase() : Observable<any> {
    return this.storage.clear();
  }

  private handleError(operation = 'operation') {
    return (error: any): Observable<Settings> => {
      if(error === 'settingsUndefined') {
        return this.storage.size.pipe(
          switchMap(size => {
            if(size) return this.clearDatabase();
            return of(undefined);
          })
        )
      }
      else if(error === 'electionType')
        return this.clearDatabase();
      else
        return this.clearDatabase();
    };
  }
}

export interface Settings {
  electionType: string,
  selectedPrecinct: {
    county: string,
    precinct: number,
    uatName?: string
  }
}

export const defaultSettings : Settings = {
  electionType: environment.electionType,
  selectedPrecinct: {
    county: null,
    precinct: null
  }
}

const schema : JSONSchema = {
  type: "object",
  required: [
      "electionType",
      "selectedPrecinct"
  ],
  properties: {
      electionType: {
          type: "string",
      },
      selectedPrecinct: {
          type: "object",
          required: [
              "county",
              "precinct"
          ],
          properties: {
              county: {
                  type: "string",
              },
              precinct: {
                  type: "integer",
              },
              uatName: {
                  type: "string",
              }
          },
      }
  },
}