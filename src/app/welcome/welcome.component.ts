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

import { Component, computed, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AppConstants, isNewDesignActivated, isNonNominalNotificationActivated } from 'src/app/shared/app-constants';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services';
import { MessageDialogService } from '@gematik/demis-portal-core-library';
import { WelcomeTileComponent } from '../welcome-tile/welcome-tile.component';
import { NGXLogger } from 'ngx-logger';
import { CommonModule } from '@angular/common';
import { EqualHeightService } from 'src/app/shared/services/equal-height.service';
import { WelcomeTileNewComponent } from '../welcome-tile-new/welcome-tile-new.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UrlTree } from '@angular/router';
import PATHOGEN_NON_NOMINAL = AppConstants.Titles.PATHOGEN_NON_NOMINAL;
import DISEASE_NON_NOMINAL = AppConstants.Titles.DISEASE_NON_NOMINAL;

declare type UserPermissions = {
  hasBedOccupencySenderRole: boolean;
  hasPathogenNotificationRole: boolean;
  hasDiseaseNotificationSenderRole: boolean;
  hasIgsDataSenderRole: boolean;
  hasIgsNotificationSenderRole: boolean;
};

declare type UserInfo = {
  isAuthenticated: boolean;
  username: string;
  permissions: UserPermissions;
};

const INITIAL_USER_INFORMATION: UserInfo = {
  isAuthenticated: false,
  username: '',
  permissions: {
    hasBedOccupencySenderRole: false,
    hasPathogenNotificationRole: false,
    hasDiseaseNotificationSenderRole: false,
    hasIgsDataSenderRole: false,
    hasIgsNotificationSenderRole: false,
  },
};

export declare type WelcomeTileInfo = {
  config: WelcomeTileConfig;
  renderingCondition?: boolean;
};

export declare type LogoImage = {
  src: string;
  alt: string;
};

export declare type WelcomeTileConfig = {
  id: string;
  titleTextRows: string[];
  tooltip: string;
  destinationRouterLink: string | UrlTree;
  logoImage?: LogoImage;
  contentParagraphs: string[];
  buttonLabel?: string;
  subTiles?: WelcomeTileInfo[];
};

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: true,
  imports: [CommonModule, WelcomeTileComponent, WelcomeTileNewComponent, MatButton, MatIcon],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly logger = inject(NGXLogger);
  private readonly equalHeightService = inject(EqualHeightService);
  userInfo = signal<UserInfo>(INITIAL_USER_INFORMATION);
  readonly isAuthenticated = computed(() => this.userInfo().isAuthenticated);

  readonly tileContainerId = 'demis-welcome-tiles-container';
  tileContentHeight: string | undefined = undefined;

  private unsubscriber = new Subject<void>();
  private authService = inject(AuthService);
  private messageDialogService = inject(MessageDialogService);

  ngOnInit() {
    this.authService.$tokenChanged.pipe(takeUntil(this.unsubscriber)).subscribe(() => this.refreshUserInfo());
    this.checkPortalConfig();
    this.refreshUserInfo();
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }

  @HostListener('window:resize', ['$event'])
  adjustTileContentHeights() {
    const contentContainers = document.getElementById(this.tileContainerId)?.getElementsByClassName('tile-content-paragraphs');

    if (!contentContainers || contentContainers.length === 0) {
      this.logger.debug('No content containers found for adjusting tile content heights.');
      return;
    }

    this.equalHeightService.adjustElementParentHeights(contentContainers);
  }

  login(): void {
    this.oidcSecurityService.authorize();
  }

  get showPathogenTile() {
    return this.userInfo().permissions.hasPathogenNotificationRole;
  }

  get showIGSTile() {
    return this.userInfo().permissions.hasIgsDataSenderRole && this.userInfo().permissions.hasIgsNotificationSenderRole;
  }

  get showNonNominalTile() {
    //TODO add check for user role
    return this.isNonNominalNotificationActivated() && this.showPathogenTile;
  }

  get showNonNominalSubTiles() {
    //TODO add check for user role
    return this.showNonNominalTile;
  }

  get tiles(): WelcomeTileInfo[] {
    return [
      // About (Mehr über DEMIS erfahren)
      {
        renderingCondition: !isNewDesignActivated(),
        config: {
          id: 'about',
          titleTextRows: AppConstants.Titles.ABOUT,
          tooltip: AppConstants.Tooltips.ABOUT,
          destinationRouterLink: `/${AppConstants.PathSegments.ABOUT}`,
          logoImage: {
            src: 'assets/images/logos/DEMIS_Bildmarke_RGB_72dpi.png',
            alt: 'DEMIS Logo',
          },
          contentParagraphs: [AppConstants.InfoTexts.ABOUT],
          buttonLabel: 'Mehr über DEMIS erfahren',
        },
      },
      // Disease (Krankheit melden)
      {
        renderingCondition: this.userInfo().permissions.hasDiseaseNotificationSenderRole,
        config: {
          id: 'disease',
          titleTextRows: isNonNominalNotificationActivated() ? AppConstants.Titles.DISEASE_NEW : AppConstants.Titles.DISEASE,
          tooltip: AppConstants.Tooltips.CLICK_TO_REPORT,
          destinationRouterLink: `/${AppConstants.PathSegments.DISEASE_NOTIFICATION}`,
          logoImage: {
            src: isNewDesignActivated() ? 'assets/images/disease-new.svg' : 'assets/images/hospitalisierung.png',
            alt: 'Logo der Erkrankungsmeldung',
          },
          contentParagraphs: [AppConstants.InfoTexts.DISEASE],
          buttonLabel: 'Melden',
        },
      },
      // Pathogen (Erregernachweis melden)
      {
        renderingCondition: this.showPathogenTile,
        config: {
          id: 'pathogen',
          titleTextRows: isNonNominalNotificationActivated() ? AppConstants.Titles.PATHOGEN_NEW : AppConstants.Titles.PATHOGEN,
          tooltip: AppConstants.Tooltips.CLICK_TO_REPORT,
          destinationRouterLink: `/${AppConstants.PathSegments.PATHOGEN_NOTIFICATION}`,
          logoImage: {
            src: isNewDesignActivated() ? 'assets/images/pathogen-new.svg' : 'assets/images/erregernachweis_mikroskop.svg',
            alt: 'Logo Erregernachweis melden',
          },
          contentParagraphs: [AppConstants.InfoTexts.PATHOGEN],
          buttonLabel: 'Melden',
        },
      },
      // §7.3-er Meldungen
      {
        renderingCondition: this.showNonNominalTile,
        config: {
          id: 'non-nominal',
          titleTextRows: AppConstants.Titles.NON_NOMINAL,
          tooltip: AppConstants.Tooltips.CLICK_TO_OPEN,
          destinationRouterLink: `/${AppConstants.PathSegments.PATHOGEN_NOTIFICATION}`,
          logoImage: {
            src: 'assets/images/non-nominal.svg',
            alt: 'Logo Erregernachweis melden',
          },
          contentParagraphs: [AppConstants.InfoTexts.NON_NOMINAL],
          subTiles: [
            {
              renderingCondition: this.showNonNominalSubTiles,
              config: {
                id: 'pathogen-non-nominal',
                titleTextRows: PATHOGEN_NON_NOMINAL,
                tooltip: AppConstants.Tooltips.CLICK_TO_REPORT,
                destinationRouterLink: `/${AppConstants.PathSegments.PATHOGEN_NOTIFICATION}`,
                contentParagraphs: [AppConstants.InfoTexts.PATHOGEN_NON_NOMINAL],
              },
            },
            {
              renderingCondition: this.showNonNominalSubTiles,
              config: {
                id: 'disease-non-nominal',
                titleTextRows: DISEASE_NON_NOMINAL,
                tooltip: AppConstants.Tooltips.CLICK_TO_REPORT,
                destinationRouterLink: `/${AppConstants.PathSegments.DISEASE_NOTIFICATION}`,
                contentParagraphs: [AppConstants.InfoTexts.DISEASE_NON_NOMINAL],
              },
            },
          ],
        },
      },
      // Bed Occupancy (Bettenbelegung melden)
      {
        renderingCondition: this.userInfo().permissions.hasBedOccupencySenderRole,
        config: {
          id: 'bed-occupancy',
          titleTextRows: AppConstants.Titles.BED_OCCUPANCY,
          tooltip: AppConstants.Tooltips.CLICK_TO_REPORT,
          destinationRouterLink: `/${AppConstants.PathSegments.BED_OCCUPANCY}`,
          logoImage: {
            src: isNewDesignActivated() ? 'assets/images/bedoccupancy-new.svg' : 'assets/images/Krankenhaus-Bett.svg',
            alt: 'Logo der Bettenbelegung Meldung',
          },
          contentParagraphs: [AppConstants.InfoTexts.BED_OCCUPANCY],
          buttonLabel: 'Melden',
        },
      },
      // IGS
      {
        renderingCondition: this.showIGSTile,
        config: {
          id: 'sequence-notification',
          titleTextRows: isNonNominalNotificationActivated() ? AppConstants.Titles.SEQUENCE_NOTIFICATION_NEW : AppConstants.Titles.SEQUENCE_NOTIFICATION,
          tooltip: AppConstants.Tooltips.UPLOAD_INFO,
          destinationRouterLink: `/${AppConstants.PathSegments.SEQUENCE_NOTIFICATION}`,
          logoImage: {
            src: isNewDesignActivated() ? 'assets/images/igs-new.svg' : 'assets/images/IGS.svg',
            alt: 'Logo der Bettenbelegung Meldung',
          },
          contentParagraphs: isNewDesignActivated()
            ? [AppConstants.InfoTexts.SEQUENCE_NOTIFICATION_NEW_DESIGN]
            : [AppConstants.InfoTexts.SEQUENCE_NOTIFICATION],
          buttonLabel: 'Melden',
        },
      },
    ];
  }

  private refreshUserInfo() {
    const determinedUsername = this.authService.getUsername();

    const userInfo: UserInfo = {
      isAuthenticated: this.authService.isAuthenticated(),
      username: determinedUsername ?? 'unknown',
      permissions: {
        hasBedOccupencySenderRole: this.authService.checkRole('bed-occupancy-sender'),
        hasPathogenNotificationRole: this.authService.checkRole('pathogen-notification-sender'),
        hasDiseaseNotificationSenderRole: this.authService.checkRole('disease-notification-sender'),
        hasIgsDataSenderRole: this.authService.checkRole('igs-sequence-data-sender') || this.authService.checkRole('igs-sequence-data-sender-fasta-only'),
        hasIgsNotificationSenderRole: this.authService.checkRole('igs-notification-data-sender'),
      },
    };

    this.logger.debug('User Info:', userInfo);
    this.userInfo.set(userInfo);
  }

  private checkPortalConfig() {
    const errorNotificationGateway = sessionStorage.getItem('PORTAL_CONFIG_ERROR');

    if (errorNotificationGateway != null) {
      this.messageDialogService.error({
        errorTitle: signal('Fehler beim Laden der Konfiguration'),
        errors: signal([
          new Error(
            'Achtung: Die Konfiguration konnte nicht geladen werden. Bitte die Anwendung neu starten. Falls der Fehler weiterhin auftritt, kontaktieren Sie bitte den Support.'
          ),
        ]),
      });
    }
  }

  protected readonly environment = environment;
  protected readonly AppConstants = AppConstants;
  protected readonly isNewDesignActivated = isNewDesignActivated;
  protected readonly isNonNominalNotificationActivated = isNonNominalNotificationActivated;
}
