import { europeansStructure, localsStructure, parliamentStructure, presidentialsStructure, referendumStructure } from './form-structures';
import { CandidateScope, ElectionType, Precint } from './types';

export const electionTypes = [
  {
    id: 'PRESIDENTIAL',
    name: 'Alegeri prezidențiale',
    formStructure: presidentialsStructure,
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
    formStructure: parliamentStructure,
    polls: [
      {
        id: 'CD',
        name: 'Camera Deputaților',
        candidateScope: CandidateScope.County,
      },
      {
        id: 'S',
        name: 'Senat',
        candidateScope: CandidateScope.County,
      },
    ],
  },
  {
    id: "EUROPEAN",
    name: "Alegeri europarlamentare",
    formStructure: europeansStructure,
    polls: [
      {
        id: 'PE',
        name: 'Parlamentul European',
        candidateScope: CandidateScope.Country,
        sicpvId: 'EUP',
      },
    ],
  },
  {
    id: 'LOCAL',
    name: 'Alegeri locale',
    formStructure: localsStructure,
    polls: [
      {
        id: 'CJ',
        name: 'Consiliul Județean',
        candidateScope: CandidateScope.County,
        availableFor: (precint) => precint.county !== 'B',
        sicpvId: 'CJ',
      },
      {
        id: 'PCJ',
        name: 'Președinte Consiliu Județean',
        candidateScope: CandidateScope.County,
        availableFor: (precint) => precint.county !== 'B',
        sicpvId: 'PCJ',
      },
      {
        id: 'CL',
        name: 'Consiliul Local',
        candidateScope: CandidateScope.Locality,
        sicpvId: 'CL',
      },
      {
        id: 'P',
        name: 'Primar',
        candidateScope: CandidateScope.Locality,
        sicpvId: 'P',
      },
      {
        id: 'CG',
        name: 'Consiliul General',
        candidateScope: CandidateScope.County,
        availableFor: (precint) => precint.county === 'B',
        sicpvId: 'CJ',
      },
      {
        id: 'PG',
        name: 'Primar General',
        candidateScope: CandidateScope.County,
        availableFor: (precint) => precint.county === 'B',
        sicpvId: 'PCJ',
      },
    ],
  },
  {
    id: 'REFERENDUM',
    name: 'Referendum',
    formStructure: referendumStructure,
    polls: [
      {
        id: 'Î1',
        name: 'Întrebarea 1',
        candidateScope: CandidateScope.Country,
      },
    ],
  },
] as const satisfies ElectionType[];

export function getElectionType(id: typeof electionTypes[number]['id']) {
  return electionTypes.find(et => et.id === id);
}

export function getElectionTypeReferendum(numberOfQuestions: number) {
  const baseType = getElectionType('REFERENDUM');
  const polls = Array.from({ length: numberOfQuestions }).map((_, index) => ({
    id: `Î${index + 1}`,
    name: `Întrebarea ${index + 1}`,
    candidateScope: CandidateScope.Country,
  }));
  return { ...baseType, polls };
}

export function getAvailablePolls(electionType: ElectionType, precint: Precint) {
  return electionType.polls.filter(poll => !poll.availableFor || poll.availableFor(precint));
}
