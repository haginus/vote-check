import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router } from "@angular/router";
import { FormsService, PVForm } from "../services/forms.service";
import { inject } from "@angular/core";
import { Candidate, Election, Poll, Precint } from "../../elections/types";
import { firstValueFrom } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getElection, isElectionAvailable } from "../../elections/elections";
import { SettingsService } from "../services/settings.service";
import { CandidatesService } from "../services/candidates.service";
import { getAvailablePolls } from "../../elections/election-types";

export interface FormData {
  election: Election;
  poll: Poll;
  precinct: Precint;
  candidates: Candidate[];
  form?: PVForm;
}

export const FormResolver: ResolveFn<FormData | null> = async (route: ActivatedRouteSnapshot) => {
  const formsService = inject(FormsService);
  const settingsService = inject(SettingsService);
  const candidatesService = inject(CandidatesService);
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  const { id } = route.params as { id?: string };
  let form: PVForm | undefined;
  let precinct!: Precint;
  let candidates: Candidate[] = [];
  let { electionId, pollId } = route.queryParams as { electionId?: string; pollId?: string };
  if (id) {
    try {
      form = await firstValueFrom(formsService.getForm(id));
    } catch (e) {
      snackBar.open('Procesul verbal nu a fost găsit.');
      router.navigate(['/']);
      return null;
    }
    electionId = form.electionId;
    pollId = form.pollId;
    precinct = form.precinct;
  } else {
    precinct = (await firstValueFrom(settingsService.getSettings())).selectedPrecinct;
  }
  const election = getElection(electionId as any);
  const poll = election ? getAvailablePolls(election.type, precinct).find(p => p.id === pollId) : undefined;
  if (!election || !poll || !isElectionAvailable(election, precinct)) {
    snackBar.open('Scrutin necunoscut.');
    router.navigate(['/']);
    return null;
  }
  const hasCandidates = !!election.type.formStructure.candidateSectionKey;
  candidates = hasCandidates
    ? await candidatesService.getCandidates(election.id, poll.id, precinct)
    : [];
  if(hasCandidates && candidates.length === 0) {
    snackBar.open('Candidații pentru această circumscripție electorală nu au putut fi încărcați.');
  }
  return { election, poll, precinct, candidates, form };
};
