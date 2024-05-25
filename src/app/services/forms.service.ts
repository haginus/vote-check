import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import candidates from '../../files/candidates.json'
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  constructor(private storage: StorageMap, private settingsService: SettingsService) { }

  createForm(form: PVForm) {
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

  editForm(id: number, form:PVForm) {
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

  getForms() : Observable<PVForm[]> {
    return this.storage.get<PVForm[]>('forms', undefined).pipe(
      map(forms => forms === undefined ? [] : forms)
    ) as Observable<PVForm[]>
  }

  watchForms() : Observable<PVForm[]> {
    return this.storage.watch('forms').pipe(
      map(forms => forms === undefined ? [] : forms)
    ) as Observable<PVForm[]>
  }

  getForm(id: number) : Observable<PVForm> {
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
        let result = { CDEP: [], SENAT: [] }
        try {
          let candidatesInCounty = {...candidates[settings.selectedPrecinct.county]};
          const minorities = candidates.MINORITATI;
          candidatesInCounty.CDEP = candidatesInCounty.CDEP.concat(minorities.CDEP).sort((a, b) => {
            if(a.party != null && b.party != null)
              return 0;
            else if(a.party != null && b.party == null)
              return -1;
            return 0;
          });
          result = { CDEP: candidatesInCounty.CDEP, SENAT: candidatesInCounty.SENAT };
        } catch(e) {}
        return result;
      })
    );
  }
}

const checkIndex = (arr : PVForm[], i : number) => { return 0 <= i && i < arr.length }

export interface PVForm {
  timestamp?: number
  type: string
  a: number[]
  /*
  a1: numarul total de alegatori din lista permanenta
  a2: numarul total de alegatori din listele suplimentare
  a3: numarul total de alegatori urna speciala
  */
  b: number[]
  /*
  b1: numarul total de alegatori PREZENTI din lista permanenta
  b2: numarul total de alegatori PREZENTI din listele suplimentare
  b3: numarul total de alegatori PREZENTI urna speciala
  */
  c: number // Numărul buletinelor de vot primite
  d: number // Numărul buletinelor de vot neîntrebuințate și anulate
  e: number // Numărul total al voturilor valabil exprimate
  f: number // Numărul voturilor nule
  g: number // Numărul voturilor albe (buletine de vot pe care nu s-a aplicat ștampila „VOTAT”)
  h: number[] // voturile candidatilor,
  [x: string]: any
}
