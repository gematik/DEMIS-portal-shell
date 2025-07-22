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

import { TestBed } from '@angular/core/testing';

import { EventTypes, OidcClientNotification, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { MockBuilder, MockReset } from 'ng-mocks';
import { NGXLogger } from 'ngx-logger';
import { of, Subject } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthServiceService', () => {
  let service: AuthService;
  const TEST_ROLE = 'test_role';

  const publicEventSubject = new Subject<OidcClientNotification<any>>();

  beforeEach(() =>
    MockBuilder(AuthService)
      .mock(OidcSecurityService, {
        getAccessToken: jasmine.createSpy().and.returnValue(of('')),
      })
      .mock(PublicEventsService, {
        registerForEvents: jasmine.createSpy().and.returnValue(publicEventSubject),
      })
      .mock(NGXLogger)
  );

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    MockReset();
  });

  it('should be created !!', () => {
    expect(service).toBeTruthy();
  });

  it('should update token on NewAuthenticationResult', done => {
    const tokenBefore = service.getEncodedToken();
    expect(tokenBefore).toBe('');
    expect(service.checkRole(TEST_ROLE)).toBeFalsy();
    const newToken = createToken(TEST_ROLE);

    // Update the mock to return the new token
    const oidcService = TestBed.inject(OidcSecurityService);
    (oidcService.getAccessToken as jasmine.Spy).and.returnValue(of(newToken));

    // Check if $tokenChange is fired, too
    service.$tokenChanged.subscribe(() => {
      done();
    });

    publicEventSubject.next({ type: EventTypes.NewAuthenticationResult });
    const tokenAfter = service.getEncodedToken();
    expect(tokenAfter).toEqual(newToken);
    expect(service.checkRole(TEST_ROLE)).toBeTruthy();
  });

  function createToken(role: any): string {
    const payload = { realm_access: { roles: [role] } };
    return `Header.${btoa(JSON.stringify(payload))}.Signature`;
  }
});
