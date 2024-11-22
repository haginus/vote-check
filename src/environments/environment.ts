import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "4.0.0",
  currentElections: [
    getElection('prezidentiale24112024'),
    getElection('referendum24112024'),
  ],
  production: false
};
