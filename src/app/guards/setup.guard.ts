import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { firstValueFrom } from "rxjs";

export const setupGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const settingsService = inject(SettingsService);
  const router = inject(Router);
  try {
    const settings = await firstValueFrom(settingsService.getSettings());
    if(!settings) {
      throw "";
    }
    return true;
  } catch (err) {
    return router.createUrlTree(['/setup']);
  }
}
