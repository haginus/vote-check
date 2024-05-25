import { getElectionType } from "./election-types";
import { Election } from "./types";

export const elections: Election[] = [
  {
    id: "parlamentare06122020",
    type: getElectionType('PARLIAMENTARY'),
    date: new Date()
  }
];

export function getElection(id: string) {
  return elections.find(election => election.id === id);
}
