import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import candidates from '../files/candidates_ct.json'

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  constructor(private storage: StorageMap) { }

  createForm(form:Form) {
    return new Observable(subscriber => {
      this.getForms().subscribe((data:Form[]) => {
        if(data == undefined) data = []
        form.timestamp = new Date().getTime()
        data.push(form);
        this.storage.set('forms', data).subscribe(() => {
          subscriber.next(data.length - 1);
          subscriber.complete();
        });
      });
    });
  }

  editForm(id: number, form:Form) {
    return new Observable(subscriber => {
      this.getForms().subscribe((data:Form[]) => {
        if(data == undefined) data = []
        if(!this.checkIndex(data, id)) {
          subscriber.error('INDEX_OUT_OF_RANGE');
          subscriber.complete();
        }
        data[id] = form;
        this.storage.set('forms', data).subscribe(() => {
          subscriber.next(true);
          subscriber.complete();
        });
      });
    });
  }

  deleteForm(id: number) {
    return new Observable(observer => {
      this.getForms().subscribe((data:Form[]) => {
        if(data == undefined) data = []
        if(this.checkIndex(data, id)) {
          data.splice(id, 1);
          this.storage.set('forms', data).subscribe({
            next: () => observer.next(true),
            error: (err) => observer.error(err),
            complete: () => observer.complete()
          });
        } else {
          observer.next(true); // if form is not there return true
          observer.complete();
        }
      });
    })
  }

  getForms() : Observable<Form[]> {
    return this.storage.get('forms') as Observable<Form[]>
  }

  watchForms() : Observable<Form[]> {
    return this.storage.watch('forms') as Observable<Form[]>
  }

  getForm(id: number) : Observable<Form> {
    return new Observable(subscriber => {
      this.getForms().subscribe(data => {
        if(this.checkIndex(data, id))
          subscriber.next(data[id]);
        else subscriber.error('INDEX_OUT_OF_RANGE');
        subscriber.complete();
      })
    })
  }

  getCandidates() : Observable<any> {
    return new Observable(observer => {
      this.watchSettings().subscribe(settings => {
        let result = { CJ: candidates.county.CJ, PCJ: candidates.county.PCJ };
        const uatData = candidates.uats[settings.uatName];
        result['P'] = uatData.P;
        result['CL'] = uatData.CL;
        observer.next(result);
      })
    })
  }

  private checkIndex = (arr : Form[], i : number) => { return 0 <= i && i < arr.length }

  getSettings() : Observable<any> {
    return this.storage.get("settings");
  }

  watchSettings() : Observable<any> {
    return this.storage.watch("settings");
  }

  saveSettings(settings : any) {
    this.storage.set("settings", settings).subscribe(() => {});
  }

}

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
