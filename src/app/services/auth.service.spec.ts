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

import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { EventTypes, OidcClientNotification, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { instance, mock, when } from 'ts-mockito';
import { of, Subject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

describe('AuthServiceService', () => {
  let service: AuthService;
  const TEST_ROLE = 'test_role';

  let mockOidcSecurityService: OidcSecurityService;
  let mockPublicEventsService: PublicEventsService;
  let mockNgxLogger: NGXLogger;
  const publicEventSubject = new Subject<OidcClientNotification<any>>();
  beforeEach(() => {
    mockOidcSecurityService = mock(OidcSecurityService);
    mockPublicEventsService = mock(PublicEventsService);
    mockNgxLogger = mock(NGXLogger);
    TestBed.configureTestingModule({
      providers: [
        { provide: OidcSecurityService, useFactory: () => instance(mockOidcSecurityService) },
        { provide: PublicEventsService, useFactory: () => instance(mockPublicEventsService) },
        { provide: NGXLogger, useFactory: () => instance(mockNgxLogger) },
      ],
    });
    when(mockOidcSecurityService.getAccessToken()).thenReturn(of(''));
    when(mockPublicEventsService.registerForEvents()).thenReturn(publicEventSubject);
    service = TestBed.inject(AuthService);
  });

  it('should be created !!', () => {
    expect(service).toBeTruthy();
  });

  it('should update token on NewAuthenticationResult', done => {
    const tokenBefore = service.getEncodedToken();
    expect(tokenBefore).toBe('');
    expect(service.checkRole(TEST_ROLE)).toBeFalsy();
    const newToken = createToken(TEST_ROLE);
    when(mockOidcSecurityService.getAccessToken()).thenReturn(of(newToken));
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
