import { CanDeactivateFn } from "@angular/router";

export interface CanDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const CanDeactivateGuard: CanDeactivateFn<any> = async (component: CanDeactivate) => {
  return component.canDeactivate();
}
