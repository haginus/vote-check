import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SimpvPullService {

  constructor(private http: HttpClient) { }

  getCountyData(county: string, timestamp?: number) {
    if(!timestamp) timestamp = new Date().getTime()
    return this.http.get(`${presenceUrl}?county=${county}&timestamp=${timestamp}`).pipe(
      catchError(this.handleError<Object>('getCountyData', {precinct: []}))
    );
  }

  getPrecincts(county: string, timestamp?: number) : Observable<Object[]> {
    return this.getCountyData(county, timestamp).pipe(
      map(res => res['precinct']),
      catchError(this.handleError<Object[]>('getPrecincts', []))
      );
      
  }

  getPrecinct(precintNo: number, county: string, timestamp?: number) {
    return new Observable(observer => {
      this.getPrecincts(county, timestamp).subscribe(precincts => {
        precintNo -= 1;
        if(precincts.length > precintNo && precintNo >= 0)
          observer.next(precincts[precintNo])
        else observer.error('INDEX_OUT_OF_RANGE');
        observer.complete();
      })
    })
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error)
      return of(result as T);
    };
  }
}

const presenceUrl = 'https://3dtosxvp1d.execute-api.eu-central-1.amazonaws.com/simpv'