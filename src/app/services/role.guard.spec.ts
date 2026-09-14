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
import { ToastrService } from 'ngx-toastr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { AppConstants } from '../shared/app-constants';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  const authService = { checkRole: vi.fn() };
  const toastrService = { error: vi.fn() };

  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ToastrService, useValue: toastrService },
      ],
    });

    injector = TestBed.inject(EnvironmentInjector);
  });

  const runGuard = (next: Partial<ActivatedRouteSnapshot>) => runInInjectionContext(injector, () => roleGuard(next as ActivatedRouteSnapshot, {} as any));

  const stubFeatureFlags = (flags: Record<string, boolean>) => {
    vi.spyOn(environment, 'featureFlags', 'get').mockReturnValue(flags as any);
  };

  it('returns true and skips role check when bypassFeatureFlag is enabled', () => {
    stubFeatureFlags({ bypassTest: true });

    const result = runGuard({ data: { bypassFeatureFlag: 'bypassTest', role: 'admin' } });

    expect(result).toBe(true);
    expect(authService.checkRole).not.toHaveBeenCalled();
    expect(toastrService.error).not.toHaveBeenCalled();
  });

  it('falls through to role check when bypassFeatureFlag is disabled', () => {
    stubFeatureFlags({ bypassTest: false });
    authService.checkRole.mockReturnValue(true);

    const result = runGuard({ data: { bypassFeatureFlag: 'bypassTest', role: 'admin' } });

    expect(result).toBe(true);
    expect(authService.checkRole).toHaveBeenCalledWith('admin');
    expect(toastrService.error).not.toHaveBeenCalled();
  });

  it('returns true when the user has the required role', () => {
    authService.checkRole.mockReturnValue(true);

    const result = runGuard({ data: { role: 'admin' } });

    expect(result).toBe(true);
    expect(authService.checkRole).toHaveBeenCalledWith('admin');
    expect(toastrService.error).not.toHaveBeenCalled();
  });

  it('returns false and shows an error toast when the user lacks the required role', () => {
    authService.checkRole.mockReturnValue(false);

    const result = runGuard({ data: { role: 'admin' } });

    expect(result).toBe(false);
    expect(authService.checkRole).toHaveBeenCalledWith('admin');
    expect(toastrService.error).toHaveBeenCalledWith(AppConstants.Messages.AUTHENTICATION_ERROR);
  });

  it('returns false and shows an error toast when no role is configured on the route', () => {
    const result = runGuard({ data: {} });

    expect(result).toBe(false);
    expect(authService.checkRole).not.toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith(AppConstants.Messages.AUTHENTICATION_ERROR);
  });
});
