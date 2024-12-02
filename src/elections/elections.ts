import { getElectionType, getElectionTypeReferendum } from "./election-types";
import { Election, Precint } from "./types";

export const elections = [
  {
    id: "locale09062024",
    type: getElectionType('LOCAL'),
    date: new Date("2024-06-09")
  },
  {
    id: "europarlamentare09062024",
    type: getElectionType('EUROPEAN'),
    date: new Date("2024-06-09"),
  },
  {
    id: "prezidentiale24112024",
    type: getElectionType('PRESIDENTIAL'),
    date: new Date("2024-11-24"),
    name: 'Alegeri prezidențiale 2024 (Tur 1)'
  },
  {
    id: "referendum24112024",
    type: getElectionTypeReferendum(3),
    date: new Date("2024-11-24"),
    name: 'Referendum local 24-11-2024 (Municipiul București)',
    constituencies: [
      { countyCode: "B" },
    ],
  },
  {
    id: "parlamentare01122024",
    type: getElectionType('PARLIAMENTARY'),
    date: new Date("2024-12-01")
  },
  {
    id: "prezidentiale08122024",
    type: getElectionType('PRESIDENTIAL'),
    date: new Date("2024-12-08"),
    name: 'Alegeri prezidențiale 2024 (Tur 2)'
  }
] as const satisfies Election[];

export function getElection(id: typeof elections[number]['id']) {
  return elections.find(election => election.id === id);
}

export function isElectionAvailable(election: Election, precinct: Precint) {
  if(!election.constituencies) {
    return true;
  }
  const precintConstituency = election.constituencies.find(c => c.countyCode === precinct.county);
  return (
    !!precintConstituency &&
    (precintConstituency.uats ? !!precintConstituency.uats.find(uat => uat === precinct.uatName) : true)
  );
}
