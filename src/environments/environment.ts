import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "3.0.0",
  currentElections: [
    getElection('locale09062024'),
    getElection('europarlamentare09062024'),
  ],
  production: false
};
