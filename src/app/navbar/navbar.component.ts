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

import { Component, inject, Input, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services';
import { AppConstants, isNonNominalNotificationActivated } from 'src/app/shared/app-constants';
import { environment } from 'src/environments/environment';
import { PackageJsonService } from '../services/package-json.service';

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
  // Nonnominal users always have both roles so there is no need to distinguish between pathogen and disease. Same goes for welcome tile
  isNonNominalTabActive: boolean = false;
  showNonNominalLinks: boolean = false;

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
      .subscribe(() => {
        this.activeTab = this.router.routerState.snapshot.url.substring(1);
        this.isPathogenTabActive = this.activeTab.includes(this.C.Tabs.PATHOGEN_TEST_RESULTS) && !this.activeTab.includes(this.C.PathSegments.NON_NOMINAL);
        this.isNonNominalTabActive = this.activeTab.includes(this.C.PathSegments.NON_NOMINAL);
      });
    this.isLoggedIn = toSignal(this.ssoAuthService.$isAuthenticated, { initialValue: false });
    this.ssoAuthService.$tokenChanged.pipe(takeUntil(this.unsubscriber)).subscribe(() => {
      this.setRoleControl();
    });

    this.setRoleControl();
  }

  get FEATURE_FLAG_PORTAL_INFOBANNER() {
    return !!environment.featureFlags?.FEATURE_FLAG_PORTAL_INFOBANNER;
  }

  navigateToDiseaseNonNominal() {
    this.router.navigateByUrl('/disease-notification/7.3/non-nominal');
  }

  navigateToDisease() {
    this.router.navigateByUrl('/disease-notification');
  }

  get version() {
    return this.packageJson.version;
  }

  get demisLogoUrl() {
    // Use the environment configuration to get the DEMIS logo URL
    return `assets/images/${environment.stageIndicator?.demisHomeLogoFile || 'DEMIS.svg'}`;
  }

  setRoleControl() {
    this.hasBedOccupencySenderRole = this.ssoAuthService.checkRole(AppConstants.Roles.BED_OCCUPANCY_SENDER);
    this.hasDiseaseNotificationSenderRole = this.ssoAuthService.checkRole(AppConstants.Roles.DISEASE_NOTIFICATION_SENDER);
    this.showPathogenLinks = this.ssoAuthService.checkRole(AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER);
    this.showNonNominalLinks =
      this.ssoAuthService.checkRole(AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER) &&
      this.ssoAuthService.checkRole(AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER);
    this.hasIgsDataSenderRole =
      this.ssoAuthService.checkRole(AppConstants.Roles.IGS_SEQUENCE_DATA_SENDER) ||
      this.ssoAuthService.checkRole(AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER_FASTA_ONLY);
    this.hasIgsNotificationSenderRole = this.ssoAuthService.checkRole(AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER);
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

  protected readonly isNonNominalNotificationActivated = isNonNominalNotificationActivated;
}
