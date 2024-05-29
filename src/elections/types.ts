import { FormGroup, ValidationErrors } from "@angular/forms";

export enum CandidateScope {
  Country = 'COUNTRY',
  County = 'COUNTY',
  Locality = 'LOCALITY',
}

export interface Candidate {
  candidate: string;
  party?: string;
}

export interface Poll {
  id: string;
  name: string;
  candidateScope: CandidateScope;
  availableFor?: (precint: Precint) => boolean;
}

type FormField = (
  | { type: 'computed'; computeFn: (form: FormGroup) => any }
  | { type: 'input'; }
) & {
  id: string;
  title: string;
  hint?: string;
}

export interface FormStructure {
  sections: {
    title: string;
    subtitle?: string;
    fields: FormField[];
  }[];
  candidateSectionKey?: string;
  validator: (form: FormGroup) => ValidationErrors | null;
  simpvPullStrategy?: (form: FormGroup, simpvPrecinct: any) => Precint;
}

export interface ElectionType {
  id: string;
  name: string;
  polls: Poll[];
  formStructure: FormStructure;
}

export interface Election {
  id: string;
  type: ElectionType;
  date: Date;
}

export type CandidatesFile =
  Record<Poll['id'], {
    [CandidateScope.Country]: Candidate[];
    [CandidateScope.County]: Record<string, Candidate[]>;
    [CandidateScope.Locality]: Record<string, Record<string, Candidate[]>>;
  }>;

export interface Precint {
  county: string;
  uatName: string;
  number: number;
}
