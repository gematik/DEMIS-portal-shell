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

import { Component, inject, input, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter, Observable, Subject, takeUntil, firstValueFrom } from 'rxjs';
import { AuthService, KcConfigService } from 'src/app/services';
import {
  AppConstants,
  FEATURE_FLAG_PORTAL_ARE_ENABLED,
  FEATURE_FLAG_PORTAL_HEADER_FOOTER,
  FEATURE_FLAG_SURVEILLANCE_PROGRAM_ADMISSION_ENABLED,
  isAnonymousNotificationActivated,
  isNonNominalFollowUpNotificationActivated,
  isNonNominalNotificationActivated,
} from 'src/app/shared/app-constants';
import { environment } from 'src/environments/environment';
import { PackageJsonService } from '../services/package-json.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormlyFormDialogProps, FormlyFormDialogService } from '../services/formly-form-dialog.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: false,
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly formlyFormDialogService = inject(FormlyFormDialogService);
  private readonly authService = inject(AuthService);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);
  private readonly ssoAuthService = inject(AuthService);
  private readonly unsubscriber = new Subject<void>();
  private readonly kcService = inject(KcConfigService);

  private readonly http = inject(HttpClient);
  readonly title = input<string>();

  activeTab: string = '';
  isLoggedIn: Signal<boolean>;

  readonly C = AppConstants;

  readonly env = environment;
  isPathogenTabActive: boolean = false;
  isDiseaseTabActive: boolean = false;
  hasBedOccupencySenderRole: boolean = false;
  hasDiseaseNotificationSenderRole: boolean = false;
  hasPathogenNotificationSenderRole: boolean = false;
  hasIgsDataSenderRole: boolean = false;
  hasIgsNotificationSenderRole: boolean = false;
  hasAreNotificationSenderRole: boolean = false;
  // Nonnominal users always have both roles so there is no need to distinguish between pathogen and disease. Same goes for welcome tile
  isNonNominalTabActive: boolean = false;
  isAnonymousTabActive: boolean = false;
  showNonNominalLinks: boolean = false;
  showAnonymousLinks: boolean = false;

  readonly packageJson = inject(PackageJsonService);

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscriber)
      )
      .subscribe(() => {
        this.activeTab = this.router.routerState.snapshot.url.substring(1);

        if (this.activeTab.includes(this.C.Tabs.HOME)) {
          this.blurActiveMenuButtons();
        }
        this.isPathogenTabActive =
          this.activeTab.includes(this.C.Tabs.PATHOGEN) &&
          !this.activeTab.includes(this.C.PathSegments.NON_NOMINAL) &&
          !this.activeTab.includes(this.C.PathSegments.ANONYMOUS);
        this.isDiseaseTabActive =
          this.activeTab.includes(this.C.Tabs.DISEASE) &&
          !this.activeTab.includes(this.C.PathSegments.NON_NOMINAL) &&
          !this.activeTab.includes(this.C.PathSegments.ANONYMOUS);
        this.isNonNominalTabActive = this.activeTab.includes(this.C.PathSegments.NON_NOMINAL);
        this.isAnonymousTabActive = this.activeTab.includes(this.C.PathSegments.ANONYMOUS);
      });
    this.isLoggedIn = toSignal(this.ssoAuthService.$isAuthenticated, { initialValue: false });
    this.ssoAuthService.$tokenChanged.pipe(takeUntil(this.unsubscriber)).subscribe(() => {
      this.setRoleControl();
    });

    this.setRoleControl();
  }

  blurActiveMenuButtons(): void {
    const menuButtons = document.querySelectorAll('.navbar-menu-btn');
    menuButtons.forEach((button: any) => {
      if (button.blur) {
        button.blur();
      }
    });
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
    this.hasPathogenNotificationSenderRole = this.ssoAuthService.checkRole(AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER);
    this.showNonNominalLinks =
      this.ssoAuthService.checkRole(AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER) &&
      this.ssoAuthService.checkRole(AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER);
    this.showAnonymousLinks = this.ssoAuthService.checkRole(AppConstants.Roles.PATHOGEN_NOTIFICATION_ANONYMOUS_SENDER);
    this.hasIgsDataSenderRole =
      this.ssoAuthService.checkRole(AppConstants.Roles.IGS_SEQUENCE_DATA_SENDER) ||
      this.ssoAuthService.checkRole(AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER_FASTA_ONLY);
    this.hasIgsNotificationSenderRole = this.ssoAuthService.checkRole(AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER);
    this.hasAreNotificationSenderRole = this.ssoAuthService.checkRole(AppConstants.Roles.ARE_NOTIFICATION_SENDER);
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

  openRegisterDialog(): void {
    if (this.showExistingAccessDialog()) return;
    this.formlyFormDialogService.showFormlyFormDialog(this.getRegisterFormConfig()).subscribe(result => result && this.handleRegistrationSuccess(result));
  }

  private showExistingAccessDialog(): boolean {
    const spuId = this.ssoAuthService.getSPUId();
    if (!spuId) return false;
    this.showInfoDialog(
      'existing-access',
      'Zugang bereits freigeschaltet',
      `Ihr Zugang zum Surveillance-System ist bereits freigeschaltet.<br><br>Die ID Ihrer verknüpften Organisation lautet: **${spuId}**<br><br>Bei weiteren Fragen melden Sie sich bitte bei der DEMIS Geschäftsstelle des Robert Koch-Instituts: [demis-support@rki.de](mailto:demis-support@rki.de)`,
      'check_circle',
      'var(--gem-demis-success-color)'
    );
    return true;
  }

  private handleRegistrationSuccess(data: any): void {
    this.oidcSecurityService.forceRefreshSession().subscribe({
      next: () => {
        this.showInfoDialog(
          'registration-success',
          'Freischaltung erfolgreich',
          `Ihre Angaben konnten erfolgreich zugeordnet werden. Sie sollten nun für die hinterlegten Surveillance-Programme freigeschaltet sein.<br><br>Die ID Ihrer verknüpften Organisation lautet: **${this.ssoAuthService.getSPUId()}**<br><br>Bei weiteren Fragen melden Sie sich bitte bei der DEMIS Geschäftsstelle des Robert Koch-Instituts: [demis-support@rki.de](mailto:demis-support@rki.de)`,
          'check_circle',
          'var(--gem-demis-success-color)'
        );
      },
      error: () => {
        this.showInfoDialog(
          'registration-success-partly',
          'Freischaltung erfolgreich',
          `Ihre Angaben konnten erfolgreich zugeordnet werden. Bitte melden Sie sich erneut bei DEMIS an, um die entsprechenden Rechte zu erhalten.<br><br>Bei weiteren Fragen melden Sie sich bitte bei der DEMIS Geschäftsstelle des Robert Koch-Instituts: [demis-support@rki.de](mailto:demis-support@rki.de)`,
          'check_circle',
          'var(--gem-demis-success-color)'
        );
      },
    });
  }

  private requestSurveillanceAccess(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getEncodedToken()}`,
    });
    const url = `${this.kcService.getConfig().authority}/surveillance-program-access/request-access`;
    return this.http.post(url, data, { headers });
  }

  private getRegisterFormConfig(): FormlyFormDialogProps {
    return {
      dialogId: 'surveillance-access-registration',
      title: 'Surveillance-System-Zugang freischalten',
      preFormText: `Bitte geben Sie den für Ihre Einrichtung vergebenen **Surveillance-User-Identifikator** und die **Postleitzahl** ein. Dieser wurde Ihnen vom Robert Koch-Institut bereitgestellt. Bei korrekter Eingabe wird Ihr Nutzerkonto mit der Organisation verknüpft und die Berechtigungen für den Zugriff auf das Surveillance-System freigeschaltet.`,
      postFormText: 'Weitere Informationen finden Sie hier: [zur DEMIS-Wissensdatenbank](https://wiki.gematik.de/x/bATWKw)',
      cancelButtonText: 'Abbrechen',
      acceptButtonText: 'Freischalten',
      secondTryValidatesAllInputs: true,
      errorNamesToCleanOnChange: ['submitValidation'],
      submitValidation: async (data, formGroup) => {
        try {
          await firstValueFrom(this.requestSurveillanceAccess(data));
          return true;
        } catch (error) {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              Object.keys(formGroup.controls).forEach(key => {
                formGroup.controls[key].setErrors({ submitValidation: true });
              });
              return false;
            }
            this.formlyFormDialogService.closeDialog();
            this.showInfoDialog(
              'technical-error',
              'Freischaltung fehlgeschlagen',
              `Ihr Zugang zum Surveillance-System konnte nicht freigeschaltet werden. Bitte versuchen Sie es später erneut. Bei anhaltenden Problemen melden Sie sich bitte bei der DEMIS Geschäftsstelle des Robert Koch-Instituts: [demis-support@rki.de](mailto:demis-support@rki.de)`,
              'error',
              'var(--gem-demis-error-color)'
            );
            return false;
          }
        }
      },
      formlyFieldConfig: [
        {
          id: 'suId',
          key: 'surveillanceProgramUserId',
          type: 'input',
          props: {
            label: 'Surveillance-User-Identifikator',
            required: true,
            description: 'Identifikationsnummer im UUID-Format.',
            pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
            attributes: {
              'aria-label': 'Identifikationsnummer im UUID-Format.',
            },
          },
          validation: {
            messages: {
              pattern: 'Ungültiges UUID-Format.',
              required: 'Surveillance-User-Identifikator ist ein Pflichtfeld.',
              submitValidation: '',
            },
          },
        },
        {
          id: 'postalCode',
          key: 'zipCode',
          type: 'input',
          props: {
            label: 'Postleitzahl der Einrichtung',
            required: true,
            description: 'Die Postleitzahl muss aus genau 5 Ziffern bestehen.',
            pattern: '[0-9]{5}',
            attributes: {
              'aria-label': 'Die Postleitzahl muss aus genau 5 Ziffern bestehen.',
            },
          },
          validation: {
            messages: {
              pattern: 'Die Postleitzahl muss aus genau 5 Ziffern bestehen.',
              required: 'Postleitzahl der Einrichtung ist ein Pflichtfeld.',
              submitValidation: 'Die Kombination aus Surveillance-User-Identifikator und Postleitzahl ist ungültig.',
            },
          },
        },
      ],
    } as FormlyFormDialogProps;
  }

  private showInfoDialog(dialogId: string, title: string, preFormText: string, titleIcon?: string, titleIconColor?: string): void {
    this.formlyFormDialogService.showFormlyFormDialog({
      dialogId,
      title,
      preFormText,
      titleIcon,
      titleIconColor,
      cancelButtonText: 'Zur Startseite',
      showAcceptButton: false,
    });
  }

  protected readonly isNonNominalNotificationActivated = isNonNominalNotificationActivated;
  protected readonly isNonNominalFollowUpNotificationActivated = isNonNominalFollowUpNotificationActivated;
  protected readonly FEATURE_FLAG_PORTAL_HEADER_FOOTER = FEATURE_FLAG_PORTAL_HEADER_FOOTER;
  protected readonly isAnonymousNotificationActivated = isAnonymousNotificationActivated;
  protected readonly FEATURE_FLAG_SURVEILLANCE_PROGRAM_ADMISSION_ENABLED = FEATURE_FLAG_SURVEILLANCE_PROGRAM_ADMISSION_ENABLED;
  protected readonly FEATURE_FLAG_PORTAL_ARE_ENABLED = FEATURE_FLAG_PORTAL_ARE_ENABLED;
}
