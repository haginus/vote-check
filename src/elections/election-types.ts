import { withWhiteVotesStructure } from './form-structures';
import { CandidateScope, ElectionType } from './types';

export const electionTypes: ElectionType[] = [
  {
    id: 'PRESIDENTIAL',
    name: 'Alegeri prezidențiale',
    formStructure: withWhiteVotesStructure,
    polls: [
      {
        id: 'P',
        name: 'Președinte',
        candidateScope: CandidateScope.Country,
      },
    ],
  },
  {
    id: 'PARLIAMENTARY',
    name: 'Alegeri parlamentare',
    formStructure: withWhiteVotesStructure,
    polls: [
      {
        id: 'CDEP',
        name: 'Camera Deputaților',
        candidateScope: CandidateScope.County,
      },
      {
        id: 'SENAT',
        name: 'Senat',
        candidateScope: CandidateScope.County,
      },
    ],
  },
  {
    id: 'LOCAL',
    name: 'Alegeri locale',
    formStructure: withWhiteVotesStructure,
    polls: [
      {
        id: 'CJ',
        name: 'Consiliul Județean',
        candidateScope: CandidateScope.County,
      },
      {
        id: 'PCJ',
        name: 'Președinte Consiliu Județean',
        candidateScope: CandidateScope.County,
      },
      {
        id: 'CL',
        name: 'Consiliul Local',
        candidateScope: CandidateScope.Locality,
      },
      {
        id: 'P',
        name: 'Primar',
        candidateScope: CandidateScope.Locality
      },
    ],
  },
];

export function getElectionType(id: string) {
  return electionTypes.find(et => et.id === id);
}
