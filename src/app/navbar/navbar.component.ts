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

import { Component, inject, Input, OnDestroy, OnInit, Signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services';
import { AppConstants } from 'src/app/shared/app-constants';
import { environment } from 'src/environments/environment';
import { PackageJsonService } from '../services/package-json.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() title: string;

  activeTab: string = '';
  isLoggedIn: Signal<boolean>;

  readonly C = AppConstants;

  readonly env = environment;
  isPathogenTabActive: boolean = false;
  hasBedOccupencySenderRole: boolean = false;
  hasDiseaseNotificationSenderRole: boolean = false;
  showPathogenLinks: boolean = false;
  hasIgsDataSenderRole: boolean = false;
  hasIgsNotificationSenderRole: boolean = false;

  readonly packageJson = inject(PackageJsonService);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);
  private readonly ssoAuthService = inject(AuthService);
  private readonly unsubscriber = new Subject<void>();

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscriber)
      )
      .subscribe(routerEvent => {
        this.activeTab = this.router.routerState.snapshot.url.substring(1);
        this.isPathogenTabActive = this.activeTab.includes(this.C.Tabs.PATHOGEN_TEST_RESULTS);
      });
    this.isLoggedIn = toSignal(this.ssoAuthService.$isAuthenticated, { initialValue: false });
    this.ssoAuthService.$tokenChanged.pipe(takeUntil(this.unsubscriber)).subscribe(() => {
      this.setRoleControl();
    });

    this.setRoleControl();
  }

  get version() {
    return this.packageJson.version;
  }

  setRoleControl() {
    this.hasBedOccupencySenderRole = this.ssoAuthService.checkRole('bed-occupancy-sender');
    this.hasDiseaseNotificationSenderRole = this.ssoAuthService.checkRole('disease-notification-sender');
    this.showPathogenLinks = this.ssoAuthService.checkRole('pathogen-notification-sender');
    this.hasIgsDataSenderRole =
      this.ssoAuthService.checkRole('igs-sequence-data-sender') || this.ssoAuthService.checkRole('igs-sequence-data-sender-fasta-only');
    this.hasIgsNotificationSenderRole = this.ssoAuthService.checkRole('igs-notification-data-sender');
  }

  ngOnInit(): void {
    this.setRoleControl();
  }

  openInNewTab(destination: string): void {
    window.open(destination, '_blank');
  }

  login(): void {
    this.oidcSecurityService.authorize();
  }

  logout(): void {
    this.oidcSecurityService.logoff().subscribe(() => {
      this.oidcSecurityService.logoffLocal();
    });
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }
}
