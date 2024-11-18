import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CountyResults, PvStage, TotalResults } from '../live-results/live-results-types';

@Injectable({
  providedIn: 'root'
})
export class ElectionResultsService {

  constructor(private http: HttpClient) { }

  private readonly resultsUrl = "http://localhost:3000";

  getCountryResults(electionId: string, stage: PvStage = 'PROV') {
    return this.http.get<TotalResults>(`${this.resultsUrl}/results/${electionId}/stage/${stage}`);
  }

  getCountyResults(electionId: string, countyCode: string, stage: PvStage = 'PROV') {
    return this.http.get<CountyResults>(`${this.resultsUrl}/results/${electionId}/stage/${stage}/county/${countyCode}`);
  }
}
