/*
    Copyright (c) 2025 gematik GmbH
    Licensed under the EUPL, Version 1.2 or - as soon they will be approved by the
    European Commission – subsequent versions of the EUPL (the "Licence").
    You may not use this work except in compliance with the Licence.
    You find a copy of the Licence in the "Licence" file or at
    https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
    Unless required by applicable law or agreed to in writing,
    software distributed under the Licence is distributed on an "AS IS" basis,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either expressed or implied.
    In case of changes by gematik find details in the "Readme" file.
    See the Licence for the specific language governing permissions and limitations under the Licence.
    *******
    For additional notes and disclaimer from gematik and in case of changes by gematik,
    find details in the "Readme" file.
 */

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from 'src/app/shared/app-constants';
import { environment } from '../../environments/environment';

export const roleGuard: CanActivateFn = (next: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  if (next.data.hasOwnProperty('bypassFeatureFlag')) {
    if (environment.featureFlags[next.data['bypassFeatureFlag']]) {
      return true;
    }
  }
  const authService = inject(AuthService);
  const toastrService = inject(ToastrService);
  let isAuthenticated = false;
  if (!!next.data['role']) {
    isAuthenticated = authService.checkRole(next.data['role']);
  }
  if (!isAuthenticated) {
    toastrService.error(AppConstants.Messages.AUTHENTICATION_ERROR);
  }
  return isAuthenticated;
};
