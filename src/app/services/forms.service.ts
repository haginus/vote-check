import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Precint } from '../../elections/types';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  constructor(private storage: StorageMap) { }

  private getFormsDict(): Observable<Record<string, PVForm>> {
    return this.storage.get<Record<string, PVForm>>('forms', undefined).pipe(
      map(forms => forms === undefined ? {} : forms)
    );
  }

  getForms(): Observable<PVForm[]> {
    return this.getFormsDict().pipe(
      map(forms => Object.values(forms))
    );
  }

  watchForms(): Observable<PVForm[]> {
    return this.storage.watch<Record<string, PVForm>>('forms', undefined).pipe(
      map(forms => forms === undefined ? [] : Object.values(forms).sort((a, b) => b.timestamp - a.timestamp))
    );
  }

  getForm(id: string): Observable<PVForm> {
    return this.getFormsDict().pipe(
      map(forms => {
        const form = forms[id];
        if(!form) {
          throw new Error('Form not found');
        }
        return form;
      })
    );
  }

  createForm(form: PVForm) {
    form.timestamp = Date.now();
    return this.getFormsDict().pipe(
      switchMap(forms => {
        forms[form.id] = form;
        return this.storage.set('forms', forms);
      }),
      map(_ => form),
    );
  }

  editForm(id: string, form: PVForm) {
    return this.getFormsDict().pipe(
      switchMap(forms => {
        if(!forms[id]) {
          throw new Error('Form not found');
        }
        forms[id] = form;
        return this.storage.set('forms', forms);
      }),
      map(_ => form),
    );
  }

  deleteForm(id: string) {
    return this.getFormsDict().pipe(
      switchMap(forms => {
        delete forms[id];
        return this.storage.set('forms', forms);
      })
    );
  }
}

export interface PVForm {
  id: string;
  timestamp: number;
  electionId: string;
  pollId: string;
  precinct: Precint;
  values: Record<string, number>;
  isArchived?: boolean;
}
