import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import candidates from '../files/candidates_ct.json'
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  constructor(private storage: StorageMap, private settingsService: SettingsService) { }

  createForm(form: Form) {
    form.timestamp = new Date().getTime();
    return this.getForms().pipe(
      switchMap(forms => {
        forms.push(form);
        return this.storage.set('forms', forms).pipe(
          map(_ => forms.length - 1)
        );
      })
    )
  }

  editForm(id: number, form:Form) {
    return this.getForms().pipe(
      switchMap(forms => {
        if(!checkIndex(forms, id)) 
          throw 'INDEX_OUT_OF_RANGE';
        forms[id] = form;
        return this.storage.set('forms', forms);
      })
    )
  }

  deleteForm(id: number) {
    return this.getForms().pipe(
      switchMap(forms => {
        if(checkIndex(forms, id)) {
          forms.splice(id, 1);
          return this.storage.set('forms', forms).pipe(
            map(res => true),
            catchError(err => of(false))
          );
        }
        return of(true);
      })
    )
  }

  getForms() : Observable<Form[]> {
    return this.storage.get<Form[]>('forms').pipe(
      map(forms => forms === undefined ? [] : forms)
    ) as Observable<Form[]>
  }

  watchForms() : Observable<Form[]> {
    return this.storage.watch('forms').pipe(
      map(forms => forms === undefined ? [] : forms)
    ) as Observable<Form[]>
  }

  getForm(id: number) : Observable<Form> {
    return this.getForms().pipe(
      map(forms => {
        if(!checkIndex(forms, id))
          throw 'INDEX_OUT_OF_RANGE';
        return forms[id]
      })
    );
  }

  getCandidates() : Observable<any> {
    return this.settingsService.watchSettings().pipe(
      map(settings => {
        let result = { CJ: candidates.county.CJ, PCJ: candidates.county.PCJ };
        const uatData = candidates.uats[settings.uatName];
        result['P'] = uatData.P;
        result['CL'] = uatData.CL;
        return result;
      })
    );
  }
}

const checkIndex = (arr : Form[], i : number) => { return 0 <= i && i < arr.length }

export interface Form {
  timestamp?: number
  type: string
  a: number[]
  /*
  a1: numarul total de alegatori din lista permanenta
  a2: numarul total de alegatori din copia de pe lista electorala complementara
  a3: numarul total de alegatori din listele suplimentare
  a4: numarul total de alegatori urna speciala
  */
  b: number[]
  /*
  b1: numarul total de alegatori PREZENTI din lista permanenta
  b2: numarul total de alegatori PREZENTI din copia de pe lista electorala complementara
  b3: numarul total de alegatori PREZENTI din listele suplimentare
  b4: numarul total de alegatori PREZENTI urna speciala
  */
  c: number // suma voturilor valabil exprimate
  d: number // buletine de vot nule
  e: number // buletine de vot primite
  f: number // buletine de vot anulate
  g: number[] // voturile candidatilor
}
