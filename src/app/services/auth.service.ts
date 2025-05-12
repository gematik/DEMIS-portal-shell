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

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, of, Subject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { logger } from 'src/app/shared/models/ts-logger';
import { unprotectedRoutes } from '../app-routing.module';
import { AppConstants } from '../shared/app-constants';

interface RealmAccess {
  roles: string[];
}

export interface Token {
  realm_access: RealmAccess;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticted = false;
  public $isAuthenticated = new BehaviorSubject<boolean>(false);
  public $tokenChanged = new Subject<void>();
  private token: Token | undefined | null;
  private useInjectedToken = false;
  private encodedToken = '';
  private jwtHelperService = new JwtHelperService();

  private checkAuthSubscription: Subscription;
  unprotectedURLs: string[] = [...unprotectedRoutes.filter(p => !!p.path && p.path !== AppConstants.PathSegments.WELCOME).map(r => r.path as string)];

  constructor(
    private oidcSecurityService: OidcSecurityService,
    publicEventsService: PublicEventsService,
    private logger: NGXLogger,
    private router: Router
  ) {
    this.$isAuthenticated.next(false);
    this.refreshToken();
    publicEventsService.registerForEvents().subscribe(e => {
      if (e.type === EventTypes.NewAuthenticationResult) {
        this.refreshToken();
      }
      if (e.type === EventTypes.SilentRenewFailed) {
        this.resetToken();
        this.router.navigateByUrl('/');
      }
    });
  }

  private refreshToken(): void {
    this.oidcSecurityService
      .getAccessToken()
      .pipe(
        catchError((err, caught) => {
          this.logger.error('Error getting JWT token:', err);
          // return empty string to reset token
          return of('');
        })
      )
      .subscribe(token => {
        this.setToken(token);
      });
  }

  setToken(encodedToken: string): void {
    if (!!encodedToken) {
      this.token = this.jwtHelperService.decodeToken(encodedToken);
      this.encodedToken = encodedToken;
      (window as any)['token'] = encodedToken;
    } else {
      this.resetToken();
    }
    this.$tokenChanged.next();
  }

  getEncodedToken(): string {
    return this.encodedToken;
  }

  checkRole(role: string): boolean {
    return !!this.token && !!this.token.realm_access?.roles?.includes(role);
  }

  resetToken(): void {
    if (this.useInjectedToken) {
      return;
    }
    this.token = undefined;
    (window as any)['token'] = undefined;
    this.encodedToken = '';
  }

  isAuthenticated(): boolean {
    return this._isAuthenticted;
  }

  setAuthenticated(isAuthenticated: boolean): void {
    this._isAuthenticted = isAuthenticated;
    this.$isAuthenticated.next(isAuthenticated);
    this.refreshToken();
    if (!isAuthenticated) {
      this.resetToken();
    }
  }

  setUseInjectedToken() {
    this.useInjectedToken = true;
  }

  get shallUseInjectedToken(): boolean {
    return this.useInjectedToken;
  }

  checkLogin() {
    if (!!this.checkAuthSubscription) {
      this.checkAuthSubscription.unsubscribe();
    }
    this.checkAuthSubscription = this.oidcSecurityService
      .checkAuth()
      .pipe(
        catchError(e => {
          logger.debug(e);
          return of({ isAuthenticated: false });
        })
      )
      .subscribe(({ isAuthenticated }) => {
        this.setAuthenticated(isAuthenticated);
        if (!this.shallUseInjectedToken && !isAuthenticated) {
          // return to start page if user is not authenticated anymore
          this.logger.debug('unprotected URLs', this.unprotectedURLs);
          const isUnprotectedUrl = this.unprotectedURLs.some(url => window.location.hash.startsWith(`#/${url}`));
          if (!isUnprotectedUrl) {
            this.logger.info('Session expired. Redirecting to start page.');
            this.router.navigateByUrl('/');
          }
        }
      });
  }

  getUsername() {
    if (!this.isAuthenticated()) {
      return null;
    }
    return this.token?.username;
  }
}
