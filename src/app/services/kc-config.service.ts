/*
 Copyright (c) 2025 gematik GmbH
 Licensed under the EUPL, Version 1.2 or - as soon they will be approved by
 the European Commission - subsequent versions of the EUPL (the "Licence");
 You may not use this work except in compliance with the Licence.
    You may obtain a copy of the Licence at:
    https://joinup.ec.europa.eu/software/page/eupl
        Unless required by applicable law or agreed to in writing, software
 distributed under the Licence is distributed on an "AS IS" basis,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the Licence for the specific language governing permissions and
 limitations under the Licence.
 */

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LogLevel, OpenIdConfiguration } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root',
})
export class KcConfigService {
  getConfig(): OpenIdConfiguration {
    return {
      authority: `${environment.keycloakConfigPortal.url}/realms/${environment.keycloakConfigPortal.realm}`,
      redirectUrl: `${window.location.origin}${window.location.pathname}`,
      postLogoutRedirectUri: `${window.location.origin}${window.location.pathname}`,
      clientId:
        window.location.origin == environment.keycloakConfigPortal.meldungDNS
          ? `${environment.keycloakConfigPortal.clientIdInternet}`
          : `${environment.keycloakConfigPortal.clientId}`,
      scope: 'openid profile email',
      responseType: 'code',
      silentRenew: true,
      silentRenewUrl: window.location.origin + '/assets/keycloak/silent-check-sso.html',
      useRefreshToken: true,
      ignoreNonceAfterRefresh: true,
      logLevel: environment.isProduction ? LogLevel.Error : LogLevel.Debug,
      startCheckSession: true,
    };
  }
}
