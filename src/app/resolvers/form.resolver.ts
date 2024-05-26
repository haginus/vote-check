import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router } from "@angular/router";
import { FormsService, PVForm } from "../services/forms.service";
import { inject } from "@angular/core";
import { Election, Poll } from "../../elections/types";
import { firstValueFrom } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getElection } from "../../elections/elections";

export interface FormData {
  election: Election;
  poll: Poll;
  form?: PVForm;
}

export const FormResolver: ResolveFn<FormData | null> = async (route: ActivatedRouteSnapshot) => {
  const { id } = route.params as { id?: string };
  let form: PVForm | undefined;
  let { electionId, pollId } = route.queryParams as { electionId?: string; pollId?: string };
  if (id) {
    const formsService = inject(FormsService);
    try {
      form = await firstValueFrom(formsService.getForm(id));
    } catch (e) {
      inject(MatSnackBar).open('Procesul verbal nu a fost găsit.');
      inject(Router).navigate(['/']);
      return null;
    }
    electionId = form.electionId;
    pollId = form.pollId;
  }
  const election = getElection(electionId);
  const poll = election?.type.polls.find(p => p.id === pollId);
  if (!election || !poll) {
    inject(MatSnackBar).open('Scrutin necunoscut.');
    inject(Router).navigate(['/']);
    return null;
  }
  return { election, poll, form };
};
