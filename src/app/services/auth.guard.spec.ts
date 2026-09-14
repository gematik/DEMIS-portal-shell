/*
    Copyright (c) 2026 gematik GmbH
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

import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ToastrService } from 'ngx-toastr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { AppConstants } from '../shared/app-constants';
import { kcAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('kcAuthGuard', () => {
  const authService = { isAuthenticated: vi.fn() };
  const toastrService = { error: vi.fn() };
  const logger = { debug: vi.fn() };

  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ToastrService, useValue: toastrService },
        { provide: NGXLogger, useValue: logger },
      ],
    });

    injector = TestBed.inject(EnvironmentInjector);
  });

  const runGuard = (next: Partial<ActivatedRouteSnapshot>): boolean => runInInjectionContext(injector, () => kcAuthGuard(next as ActivatedRouteSnapshot));

  const stubFeatureFlags = (flags: Record<string, boolean>) => {
    vi.spyOn(environment, 'featureFlags', 'get').mockReturnValue(flags as any);
  };

  it('returns true and skips auth check when bypassFeatureFlag is enabled', () => {
    stubFeatureFlags({ bypassTest: true });

    const result = runGuard({ data: { bypassFeatureFlag: 'bypassTest' } });

    expect(result).toBe(true);
    expect(authService.isAuthenticated).not.toHaveBeenCalled();
    expect(toastrService.error).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('falls through to auth check when bypassFeatureFlag is disabled', () => {
    stubFeatureFlags({ bypassTest: false });
    authService.isAuthenticated.mockReturnValue(true);

    const result = runGuard({ data: { bypassFeatureFlag: 'bypassTest' } });

    expect(result).toBe(true);
    expect(authService.isAuthenticated).toHaveBeenCalledOnce();
    expect(toastrService.error).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('AuthGuard :: passed');
  });

  it('returns true and logs "passed" when user is authenticated', () => {
    authService.isAuthenticated.mockReturnValue(true);

    const result = runGuard({ data: {} });

    expect(result).toBe(true);
    expect(toastrService.error).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('AuthGuard :: passed');
  });

  it('returns false, shows toast and logs "rejected" when user is not authenticated', () => {
    authService.isAuthenticated.mockReturnValue(false);

    const result = runGuard({ data: {} });

    expect(result).toBe(false);
    expect(toastrService.error).toHaveBeenCalledWith(AppConstants.Messages.AUTHENTICATION_ERROR);
    expect(logger.debug).toHaveBeenCalledWith('AuthGuard :: rejected ==> redirecting to authentication');
  });

  it('performs auth check when data has no bypassFeatureFlag property', () => {
    authService.isAuthenticated.mockReturnValue(true);

    const result = runGuard({ data: { other: 'value' } });

    expect(result).toBe(true);
    expect(authService.isAuthenticated).toHaveBeenCalledOnce();
  });
});
