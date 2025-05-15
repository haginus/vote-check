import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "5.1.0",
  currentElections: [
    getElection('prezidentiale18052025'),
  ],
};
