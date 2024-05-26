import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { JSONSchema } from '@ngx-pwa/local-storage';
import { Precint } from '../../elections/types';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private storage: StorageMap) {}

  getSettings(): Observable<Settings> {
    return this.storage.get<Settings>('settings', schema).pipe(
      tap((settings) => {
        if (settings == undefined) throw 'settingsUndefined';
      }),
      catchError(this.handleError('getSettings'))
    );
  }

  watchSettings(): Observable<Settings> {
    return this.storage
      .watch<Settings>('settings', schema)
      .pipe(catchError(this.handleError('watchSettings')));
  }

  saveSettings(settings: Settings) {
    return this.storage
      .set('settings', settings, schema)
      .pipe(map((_) => settings));
  }

  private clearDatabase(): Observable<any> {
    return this.storage.clear();
  }

  private handleError(operation = 'operation') {
    return (error: any): Observable<Settings> => {
      if (error === 'settingsUndefined') {
        return this.storage.size.pipe(
          switchMap((size) => {
            if (size) return this.clearDatabase();
            return of(undefined);
          })
        );
      } else if (error === 'electionType') return this.clearDatabase();
      else return this.clearDatabase();
    };
  }
}

export interface Settings {
  selectedPrecinct: Precint;
}

export const defaultSettings: Settings = {
  selectedPrecinct: {
    county: null!,
    uatName: null!,
    number: null!,
  },
};

const schema: JSONSchema = {
  type: 'object',
  required: ['selectedPrecinct'],
  properties: {
    selectedPrecinct: {
      type: 'object',
      required: ['county', 'number', 'uatName'],
      properties: {
        county: {
          type: 'string',
        },
        number: {
          type: 'integer',
        },
        uatName: {
          type: 'string',
        },
      },
    },
  },
};
