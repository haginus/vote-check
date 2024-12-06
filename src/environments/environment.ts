import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "5.0.1",
  currentElections: [
    getElection('parlamentare01122024'),
  ],
};
