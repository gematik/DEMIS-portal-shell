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

import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { NGXLogger } from 'ngx-logger';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from '../environments/environment';
import { initLogger } from 'src/app/shared/models/ts-logger';
import { JwtHelperService } from '@auth0/angular-jwt';
// don't shorten the import, or all tests will break
import { AuthService } from './services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { AppConstants } from './shared/app-constants';
import { NavigationStateStore } from './services/navigation-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DEMIS-Meldeportal';
  env = environment;
  TOKEN_PARAM = 'inject_token';
  readonly SESSION_DURATION: number = 8;

  private authenticatedSubscription: Subscription;
  private authChangedSubscription: Subscription;
  private readonly jwtHelper = new JwtHelperService();

  private readonly logger = inject(NGXLogger);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly unsubscriber = new Subject<void>();
  isActiveTabHome: WritableSignal<boolean> = signal(false);
  private readonly navigationStateStore = inject(NavigationStateStore);

  constructor() {
    // "initLogger()" is used to instantiate a singleton object of NgxLogger
    // for classes and files where NgxLogger cannot be injected.
    initLogger(this.logger);
    this.updateLoggerConfig();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscriber)
      )
      .subscribe(routerEvent => {
        this.navigationStateStore.setLastNavigationEnd(routerEvent);
        const activeTab = this.router.routerState.snapshot.url.substring(1);
        this.isActiveTabHome.set(activeTab.includes(AppConstants.Tabs.HOME));
      });
  }

  ngOnInit(): void {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    const injectedToken = urlParams.get(this.TOKEN_PARAM);
    if (environment.featureFlags.CONFIG_TOKEN_INJECTION_ENABLED && !!injectedToken) {
      this.injectToken(injectedToken);
    } else {
      this.initializeKeycloakAuthorization();
    }
    this.logger.debug('AppComponent initialized with the following environment', environment);
  }

  ngOnDestroy() {
    if (this.authenticatedSubscription) {
      this.authenticatedSubscription.unsubscribe();
    }
    if (this.authChangedSubscription) {
      this.authChangedSubscription.unsubscribe();
    }
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }

  private updateLoggerConfig() {
    const updatedConfig = this.logger.getConfigSnapshot();
    updatedConfig.level = environment.ngxLoggerConfig.level;
    updatedConfig.disableConsoleLogging = environment.ngxLoggerConfig.disableConsoleLogging;
    updatedConfig.serverLogLevel = environment.ngxLoggerConfig.serverLogLevel;

    this.logger.updateConfig(updatedConfig);
  }

  private injectToken(base64EncodedToken: string) {
    const decodedToken = this.jwtHelper.decodeToken(base64EncodedToken);
    if (!!decodedToken?.iss && environment.issuersDemis && environment.issuersDemis?.length > 0) {
      environment.issuersDemis.some(issuer => {
        if (decodedToken.iss === issuer) {
          this.authService.setUseInjectedToken();
          this.authService.setAuthenticated(true);
          this.authService.setToken(base64EncodedToken);
        }
      });
    }
  }

  private initializeKeycloakAuthorization() {
    // synchronous call evertime the ngOnInit gets called - calls for token explizitly
    //this.authService.checkLogin();
    this.authenticatedSubscription = this.oidcSecurityService.isAuthenticated$.subscribe(res => {
      this.authService.setAuthenticated(res.isAuthenticated);
    });
    //async call everytime the oidc throws a checkeventchanged - calls for token explizitly
    this.authChangedSubscription = this.oidcSecurityService.checkSessionChanged$.subscribe(() => {
      this.authService.checkLogin();
    });
  }

  protected readonly environment = environment;
}
