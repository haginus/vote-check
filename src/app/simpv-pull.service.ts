import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SimpvPullService {

  constructor(private http: HttpClient) { }

  getCountyData(county: string, timestamp?: number) {
    county = county.toLowerCase()
    if(!timestamp) timestamp = new Date().getTime()
    return this.http.get(`${presenceUrl}?county=${county}&timestamp=${timestamp}`).pipe(
      retry(3),
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
    return this.getPrecincts(county, timestamp).pipe(
      map(precincts => {
        precintNo -= 1
        if(!(0 <= precintNo && precintNo < precincts.length))
          throw 'INDEX_OUT_OF_RANGE'
        return precincts[precintNo]
      })
    )
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}

const presenceUrl = 'https://3dtosxvp1d.execute-api.eu-central-1.amazonaws.com/simpv'