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
    For additional notes and disclaimer from gematik and in case of changes by gematik find details in the "Readme" file.
 */

import { inject } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../shared/app-constants';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { ActivatedRouteSnapshot } from '@angular/router';

export const kcAuthGuard = (next: ActivatedRouteSnapshot): boolean => {
  if (next.data.hasOwnProperty('bypassFeatureFlag')) {
    if (environment.featureFlags[next.data['bypassFeatureFlag']]) {
      return true;
    }
  }
  const authService = inject(AuthService);
  const logger = inject(NGXLogger);
  const toastrService = inject(ToastrService);
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    toastrService.error(AppConstants.Messages.AUTHENTICATION_ERROR);
  }
  const logMsg = isAuthenticated ? 'passed' : 'rejected ==> redirecting to authentication';
  logger.debug(`AuthGuard :: ${logMsg}`);
  return isAuthenticated;
};
