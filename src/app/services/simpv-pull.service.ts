import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SimpvPullService {

  constructor(private http: HttpClient) { }

  getCountyData(electionId: string, county: string, timestamp = Date.now()) {
    county = county.toLowerCase();
    return this.http.get(`${presenceUrl}?electionId=${electionId}&county=${county}&timestamp=${timestamp}`);
  }

  getPrecincts(electionId: string, county: string, timestamp?: number) : Observable<Object[]> {
    return this.getCountyData(electionId, county, timestamp).pipe(
      map(res => res['precinct']),
    );

  }

  getPrecinct(electionId: string, precintNo: number, county: string, timestamp?: number) {
    return this.getPrecincts(electionId, county, timestamp).pipe(
      map(precincts => {
        precintNo -= 1
        if(!(0 <= precintNo && precintNo < precincts.length))
          throw 'INDEX_OUT_OF_RANGE'
        return precincts[precintNo]
      })
    )
  }

}

const presenceUrl = 'https://us-central1-hns-mainland.cloudfunctions.net/simpv';
