import { getElection } from "../elections/elections";

export const environment = {
  appVersion: "3.0.0" + '-dev',
  currentElections: [
    getElection('locale27092020'), // We keep this for now as SIMPV is not live yet for the new elections
    getElection('locale09062024'),
    getElection('europarlamentare09062024'),
  ],
  production: false
};
