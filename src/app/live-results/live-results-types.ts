export interface CandidateResult {
  candidate: string;
  party: string | null;
  votes: number;
}

export interface CategoryResults {
  validVotes: number;
  invalidVotes: number;
  candidateVotes: CandidateResult[];
}

export interface Results {
  castVotes: number;
  countedVotes: number;
  categories: Record<string, CategoryResults>;
}

export interface CountyPresence {
  registeredVoters: number;
  castVotes: number;
  countyCode: string;
  countyName: string;
  precincts: PrecinctPresence[];
}

export interface PrecinctPresence {
  registeredVoters: number;
  castVotes: number;
  precint: {
    id: number;
    number: string;
    name: string;
  }
  uat: {
    id: number;
    name: string;
  };
  locality: {
    id: number;
    name: string;
  }
}

export type PrecinctResults = PrecinctPresence & Results;

export type TotalResults = Omit<TotalResultsDetailed, 'counties'> & {
  counties: Omit<CountyResults, 'precincts'>[];
}

export interface TotalResultsDetailed extends Results {
  registeredVoters: number;
  counties: CountyResults[];
}

export type CountyResults = Omit<CountyPresence, 'precincts'> & Results & {
  precincts: PrecinctResults[];
}

export type PvStage = 'PROV' | 'PART' | 'FINAL';
