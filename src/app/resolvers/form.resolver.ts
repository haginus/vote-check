import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { FormsService, PVForm } from "../services/forms.service";
import { inject } from "@angular/core";

export const FormResolver: ResolveFn<PVForm | undefined> = (route: ActivatedRouteSnapshot) => {
  const { id } = route.params as { id: string };
  return inject(FormsService).getForm(id);
};
