import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "3.0.0" + '-dev',
  currentElections: [
    getElection('parlamentare06122020'),
    getElection('prezidentiale15092024'),
  ],
  production: false
};
