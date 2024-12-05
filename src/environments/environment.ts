import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "5.0.1",
  currentElections: [
    getElection('prezidentiale08122024'),
  ],
};
