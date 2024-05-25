import { Injectable } from "@angular/core";
import { CandidateScope, CandidatesFile, Precint } from "../../elections/types";
import { SettingsService } from "./settings.service";
import { map } from "rxjs";
import { elections, getElection } from "../../elections/elections";

@Injectable({
  providedIn: 'any'
})
export class CandidatesService {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  async getCandidatesFile(electionId: string): Promise<CandidatesFile> {
    return import(`../../files/candidates/${electionId}.json`);
  }

  async getCandidates(electionId: string, pollId: string, precinct: Precint) {
    const candidatesFile = await this.getCandidatesFile(electionId);
    const election = getElection(electionId);
    const poll = election?.type.polls.find(poll => poll.id === pollId);
    if (!poll) {
      throw new Error(`Poll with id ${pollId} not found in election ${electionId}`);
    }
    const candidateScope = poll.candidateScope;
    switch (candidateScope) {
      case CandidateScope.Country:
        return candidatesFile[pollId][candidateScope];
      case CandidateScope.County:
        return candidatesFile[pollId][candidateScope][precinct.county];
      case CandidateScope.Locality:
        return candidatesFile[pollId][candidateScope][precinct.county][precinct.uatName];
      default:
        throw new Error(`Invalid candidate scope: ${candidateScope}`);
    }

  }
}
