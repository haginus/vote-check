import { getElectionType } from "./election-types";
import { Election } from "./types";

export const elections = [
  {
    id: "locale27092020",
    type: getElectionType('LOCAL'),
    date: new Date("2020-09-27")
  },
  {
    id: "locale09062024",
    type: getElectionType('LOCAL'),
    date: new Date("2024-06-09")
  },
  {
    id: "europarlamentare09062024",
    type: getElectionType('EUROPEAN'),
    date: new Date("2024-06-09")
  }
] as const satisfies Election[];

export function getElection(id: typeof elections[number]['id']) {
  return elections.find(election => election.id === id);
}
