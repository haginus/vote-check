import { withWhiteVotesStructure } from './form-structures';
import { CandidateScope, ElectionType, Precint } from './types';

export const electionTypes = [
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
    id: "EUROPEAN",
    name: "Alegeri europarlamentare",
    formStructure: withWhiteVotesStructure,
    polls: [
      {
        id: 'PE',
        name: 'Parlamentul European',
        candidateScope: CandidateScope.Country,
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
        availableFor: (precint) => precint.county !== 'B',
      },
      {
        id: 'PCJ',
        name: 'Președinte Consiliu Județean',
        candidateScope: CandidateScope.County,
        availableFor: (precint) => precint.county !== 'B',
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
      {
        id: 'CG',
        name: 'Consiliul General',
        candidateScope: CandidateScope.County,
        availableFor: (precint) => precint.county === 'B',
      },
      {
        id: 'PG',
        name: 'Primar General',
        candidateScope: CandidateScope.County,
        availableFor: (precint) => precint.county === 'B',
      },
    ],
  },
  {
    id: 'REFERENDUM',
    name: 'Referendum',
    formStructure: withWhiteVotesStructure,
    polls: [
      {
        id: 'R',
        name: 'Întrebarea 1',
        candidateScope: CandidateScope.Country,
      },
    ],
  },
] as const satisfies ElectionType[];

export function getElectionType(id: typeof electionTypes[number]['id']) {
  return electionTypes.find(et => et.id === id);
}

export function getAvailablePolls(electionType: ElectionType, precint: Precint) {
  return electionType.polls.filter(poll => !poll.availableFor || poll.availableFor(precint));
}
