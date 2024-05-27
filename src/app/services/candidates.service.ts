import { Injectable } from "@angular/core";
import { CandidateScope, CandidatesFile, Precint } from "../../elections/types";
import { getElection } from "../../elections/elections";

@Injectable({
  providedIn: 'any'
})
export class CandidatesService {

  async getCandidatesFile(electionId: string): Promise<CandidatesFile> {
    return import(`../../files/candidates/${electionId}.json`);
  }

  async getCandidates(electionId: string, pollId: string, precinct: Precint) {
    const election = getElection(electionId as any);
    const poll = election?.type.polls.find(poll => poll.id === pollId);
    if (!poll) {
      throw new Error(`Poll with id ${pollId} not found in election ${electionId}`);
    }
    try {
      const candidatesFile = await this.getCandidatesFile(electionId);
      const candidateScope = poll.candidateScope;
      switch (candidateScope) {
        case CandidateScope.Country:
          return candidatesFile?.[pollId]?.[candidateScope] || [];
        case CandidateScope.County:
          return candidatesFile?.[pollId]?.[candidateScope]?.[precinct.county] || [];
        case CandidateScope.Locality:
          return candidatesFile[pollId]?.[candidateScope]?.[precinct.county]?.[precinct.uatName] || [];
        default:
          throw new Error(`Invalid candidate scope: ${candidateScope}`);
      }
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
