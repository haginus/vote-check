import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "5.1.0",
  currentElections: [
    getElection('parlamentare01122024'),
  ],
};
