import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "3.2.0",
  currentElections: [
    getElection('europarlamentare09062024'),
    getElection('locale09062024'),
  ],
  production: false
};
