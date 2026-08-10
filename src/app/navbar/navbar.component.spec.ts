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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { MockBuilder, MockedComponentFixture, MockInstance, MockProvider, MockRender, MockService, ngMocks } from 'ng-mocks';
import { BehaviorSubject, defer, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { MessageDialogService } from '@gematik/demis-portal-core-library';
import { AuthService } from '../services';
import { NavbarComponent } from './navbar.component';
import { PackageJsonService } from '../services/package-json.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppConstants } from '../shared/app-constants';
import { InfoBannerSectionComponent } from '../info-banner-section/info-banner-section.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { FormlyFormDialogProps, FormlyFormDialogService } from '../services/formly-form-dialog.service';
import { AccessibleTextComponent } from '../shared/components/accessible-text/accessible-text.component';
import { TestFixtures } from 'src/test/test-fixtures';

describe('Navbar Test', () => {
  let component: NavbarComponent;
  let fixture: MockedComponentFixture<NavbarComponent>;
  const tokenChangedSubject = new Subject<void>();
  const authSubject = new BehaviorSubject(true);
  const routerEvents = new ReplaySubject<NavigationEnd>(1);
  MockInstance.scope('case');

  (window as any)['config'] = TestFixtures.CONFIG;

  const createComponent = () => {
    fixture = MockRender(NavbarComponent);
    component = fixture.point.componentInstance;
  };

  const mockRouter = {
    events: routerEvents,
    routerState: {
      snapshot: {
        url: '',
      },
    },
    navigateByUrl: vi.fn(),
    createUrlTree: vi.fn().mockImplementation((commands: any[], extras?: any) => ({
      commands,
      extras,
    })),
    navigate: vi.fn(),
    serializeUrl: vi.fn().mockImplementation((urlTree: any) => '/' + urlTree.commands.join('/')),
  };

  beforeEach(() => {
    return MockBuilder(NavbarComponent)
      .keep(RouterLink)
      .keep(RouterLinkActive)
      .provide(provideLocationMocks())
      .keep(MatTabsModule)
      .keep(MatToolbarModule)
      .keep(MatDividerModule)
      .keep(MatMenuModule)
      .keep(PackageJsonService)
      .keep(NoopAnimationsModule)
      .provide(MockProvider(OidcSecurityService))
      .provide({
        provide: AuthService,
        useValue: {
          ...MockService(AuthService),
          $tokenChanged: tokenChangedSubject,
          $isAuthenticated: authSubject,
        } as AuthService,
      })
      .mock(MessageDialogService)
      .provide({ provide: Router, useValue: mockRouter })
      .mock(ActivatedRoute)
      .mock(MatIconModule)
      .mock(InfoBannerSectionComponent)
      .mock(AccessibleTextComponent);
  });

  describe('new navbar', () => {
    beforeEach(() => {
      (window as any)['config'].featureFlags.FEATURE_FLAG_FOLLOW_UP_7_3 = true;
    });
    it('should create', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    // Test if menu-entries are correctly shown depending on user roles
    TestFixtures.JWT_ROLES.forEach(parameter => {
      it(`check if role ${parameter.roles.join(',')} shows menu entry ${parameter.link}`, () => {
        createComponent();
        vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(role => parameter.roles.includes(role as AppConstants.Roles));
        ngMocks.flushTestBed();
        createComponent();
        fixture.detectChanges();
        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();
        const link = document.querySelector(`#${parameter.link}`);
        expect(!!link).toBeTruthy();
      });

      it(`${!parameter.doNegativeTest ? 'deactivated -- ' : ''}check if tile ${parameter.link} is removed if role ${parameter.roles.join(',')} is missing`, () => {
        if (parameter.doNegativeTest) {
          createComponent();
          vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(() => false);
          ngMocks.flushTestBed();
          createComponent();
          fixture.detectChanges();
          const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
          burgerButton.click();
          fixture.detectChanges();
          const link = document.querySelector(`#${parameter.link}`);
          expect(!!link).toBeFalsy();
        }
      });
    });

    [AppConstants.Roles.IGS_SEQUENCE_DATA_SENDER, AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER_FASTA_ONLY].forEach(presentRole => {
      it(`Should show link a-to-sequence-notification if only ${presentRole} is present`, () => {
        createComponent();
        vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(
          (role: string) => presentRole === role || AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER === role
        );
        ngMocks.flushTestBed();
        createComponent();
        fixture.detectChanges();
        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();
        const link = document.querySelector(`#a-to-sequence-notification`);
        expect(!!link).toBeTruthy();
      });
    });

    it('should display the disease menu items', async () => {
      createComponent();
      fixture.detectChanges();
      vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(
        (role: string) => AppConstants.Roles.DISEASE_NOTIFICATION_SENDER === role
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const diseaseButton = document.querySelector('#menu-disease') as HTMLElement;
      diseaseButton.click();
      fixture.detectChanges();

      const menuItemFollowUp = document.querySelector('#a-to-disease-follow-up') as HTMLElement;
      expect(menuItemFollowUp).toBeTruthy();
      const menuItemNominal = document.querySelector('#a-to-disease-nominal') as HTMLElement;
      expect(menuItemNominal).toBeTruthy();
    });

    it('should display the disease non-nominal menu item and navigate to the correct route on click', async () => {
      createComponent();
      fixture.detectChanges();
      const authService = fixture.point.injector.get(AuthService);
      vi.spyOn(authService, 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const router = fixture.point.injector.get(Router);

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const nonNominalButton = document.querySelector('#menu-non-nominal') as HTMLElement;
      nonNominalButton.click();
      fixture.detectChanges();

      const menuItemDisease = document.querySelector('#a-to-disease-non-nominal') as HTMLElement;
      expect(menuItemDisease).toBeTruthy();

      menuItemDisease.click();
      fixture.detectChanges();

      expect(router.navigateByUrl).toHaveBeenCalledWith(expect.objectContaining({ commands: ['disease-notification/7.3/non-nominal'] }), expect.any(Object));
    });
    it('should display the pathogen non-nominal menu item and navigate to the correct route on click', async () => {
      createComponent();
      fixture.detectChanges();
      const authService = fixture.point.injector.get(AuthService);
      vi.spyOn(authService, 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const router = fixture.point.injector.get(Router);

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const nonNominalButton = document.querySelector('#menu-non-nominal') as HTMLElement;
      nonNominalButton.click();
      fixture.detectChanges();

      const menuItemPathogen = document.querySelector('#a-to-pathogen-non-nominal') as HTMLElement;
      expect(menuItemPathogen).toBeTruthy();

      menuItemPathogen.click();
      expect(router.navigateByUrl).toHaveBeenCalledWith(expect.objectContaining({ commands: ['pathogen-notification/7.3/non-nominal'] }), expect.any(Object));
    });

    it('should display the non-nominal follow-up menu items when FEATURE_FLAG_FOLLOW_UP_7_3 is enabled', async () => {
      (window as any)['config'].featureFlags.FEATURE_FLAG_FOLLOW_UP_7_3 = true;
      createComponent();
      fixture.detectChanges();
      const authService = fixture.point.injector.get(AuthService);
      vi.spyOn(authService, 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const nonNominalButton = document.querySelector('#menu-non-nominal') as HTMLElement;
      nonNominalButton.click();
      fixture.detectChanges();

      const pathogenFollowUp = document.querySelector('#a-to-pathogen-non-nominal-follow-up') as HTMLElement;
      expect(pathogenFollowUp).toBeTruthy();
      const diseaseFollowUp = document.querySelector('#a-to-disease-non-nominal-follow-up') as HTMLElement;
      expect(diseaseFollowUp).toBeTruthy();
    });

    it('should not display the non-nominal follow-up menu items when FEATURE_FLAG_FOLLOW_UP_7_3 is disabled', async () => {
      // TODO remove test when FEATURE_FLAG_FOLLOW_UP_7_3 is removed
      (window as any)['config'].featureFlags.FEATURE_FLAG_FOLLOW_UP_7_3 = false;
      createComponent();
      fixture.detectChanges();
      const authService = fixture.point.injector.get(AuthService);
      vi.spyOn(authService, 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const nonNominalButton = document.querySelector('#menu-non-nominal') as HTMLElement;
      nonNominalButton.click();
      fixture.detectChanges();

      const pathogenFollowUp = document.querySelector('#a-to-pathogen-non-nominal-follow-up') as HTMLElement;
      expect(pathogenFollowUp).toBeFalsy();
      const diseaseFollowUp = document.querySelector('#a-to-disease-non-nominal-follow-up') as HTMLElement;
      expect(diseaseFollowUp).toBeFalsy();
    });

    it('should navigate to pathogen non-nominal follow-up on click', async () => {
      (window as any)['config'].featureFlags.FEATURE_FLAG_FOLLOW_UP_7_3 = true;
      createComponent();
      fixture.detectChanges();
      const authService = fixture.point.injector.get(AuthService);
      vi.spyOn(authService, 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const router = fixture.point.injector.get(Router);

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const nonNominalButton = document.querySelector('#menu-non-nominal') as HTMLElement;
      nonNominalButton.click();
      fixture.detectChanges();

      const menuItem = document.querySelector('#a-to-pathogen-non-nominal-follow-up') as HTMLElement;
      expect(menuItem).toBeTruthy();

      menuItem.click();
      fixture.detectChanges();

      expect(router.navigateByUrl).toHaveBeenCalledWith(expect.objectContaining({ commands: ['pathogen-notification/7.3/follow-up'] }), expect.any(Object));
    });

    it('should navigate to disease non-nominal follow-up on click', async () => {
      (window as any)['config'].featureFlags.FEATURE_FLAG_FOLLOW_UP_7_3 = true;
      createComponent();
      fixture.detectChanges();
      const authService = fixture.point.injector.get(AuthService);
      vi.spyOn(authService, 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const router = fixture.point.injector.get(Router);

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const nonNominalButton = document.querySelector('#menu-non-nominal') as HTMLElement;
      nonNominalButton.click();
      fixture.detectChanges();

      const menuItem = document.querySelector('#a-to-disease-non-nominal-follow-up') as HTMLElement;
      expect(menuItem).toBeTruthy();

      menuItem.click();
      fixture.detectChanges();

      expect(router.navigateByUrl).toHaveBeenCalledWith(expect.objectContaining({ commands: ['disease-notification/7.3/follow-up'] }), expect.any(Object));
    });

    it('should display the pathogen menu items', async () => {
      createComponent();
      fixture.detectChanges();
      vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(
        (role: string) => AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER === role
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const pathogenButton = document.querySelector('#menu-pathogen') as HTMLElement;
      pathogenButton.click();
      fixture.detectChanges();

      const menuItemFollowUp = document.querySelector('#a-to-pathogen-follow-up') as HTMLElement;
      expect(menuItemFollowUp).toBeTruthy();
      const menuItemNominal = document.querySelector('#a-to-pathogen-nominal') as HTMLElement;
      expect(menuItemNominal).toBeTruthy();
    });

    it('should display the anonymous menu items', async () => {
      createComponent();
      fixture.detectChanges();
      vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(
        (role: string) => role === AppConstants.Roles.PATHOGEN_NOTIFICATION_ANONYMOUS_SENDER
      );
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const menuItemPathogen = document.querySelector('#a-to-pathogen-anonymous') as HTMLElement;
      expect(menuItemPathogen).toBeTruthy();
    });

    it('should navigate to pathogen anonymous on click', async () => {
      createComponent();
      fixture.detectChanges();
      const authService = fixture.point.injector.get(AuthService);
      vi.spyOn(authService, 'checkRole').mockImplementation((role: string) => role === AppConstants.Roles.PATHOGEN_NOTIFICATION_ANONYMOUS_SENDER);
      ngMocks.flushTestBed();
      createComponent();
      fixture.detectChanges();

      const router = fixture.point.injector.get(Router);

      const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
      burgerButton.click();
      fixture.detectChanges();

      const menuItem = document.querySelector('#a-to-pathogen-anonymous') as HTMLElement;
      expect(menuItem).toBeTruthy();

      menuItem.click();
      fixture.detectChanges();
      expect(router.navigateByUrl).toHaveBeenCalledWith(expect.objectContaining({ commands: ['pathogen-notification/7.3/anonymous'] }), expect.any(Object));
    });
  });

  describe('Register surveillance program tests', () => {
    beforeEach(() => {
      createComponent();
      component.hasAreNotificationSenderRole = true;
      fixture.detectChanges();
    });

    describe('visibility buttons depending on feature flags FEATURE_FLAG_SURVEILLANCE_PROGRAM & FEATURE_FLAG_PORTAL_ARE_ENABLED', () => {
      it('should show register surveillance program button when FEATURE_FLAG_SURVEILLANCE_PROGRAM is enabled', () => {
        (window as any)['config'].featureFlags.FEATURE_FLAG_SURVEILLANCE_PROGRAM_ADMISSION_ENABLED = true;

        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();

        const actionButton = document.querySelector('#btn-register-for-surveillance-system') as HTMLElement;
        expect(actionButton).toBeTruthy();
      });

      it('should not display register surveillance program button when FEATURE_FLAG_SURVEILLANCE_PROGRAM is disabled', () => {
        (window as any)['config'].featureFlags.FEATURE_FLAG_SURVEILLANCE_PROGRAM_ADMISSION_ENABLED = false;

        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();

        const actionButton = document.querySelector('#btn-register-for-surveillance-system') as HTMLElement;
        expect(actionButton).toBeFalsy();
      });

      it('should show are link when FEATURE_FLAG_PORTAL_ARE_ENABLED is enabled', () => {
        (window as any)['config'].featureFlags.FEATURE_FLAG_PORTAL_ARE_ENABLED = true;

        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();

        const actionButton = document.querySelector('#a-to-are-notification') as HTMLElement;
        expect(actionButton).toBeTruthy();
      });

      it('should not display are link when FEATURE_FLAG_PORTAL_ARE_ENABLED is disabled', () => {
        (window as any)['config'].featureFlags.FEATURE_FLAG_PORTAL_ARE_ENABLED = false;

        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();

        const actionButton = document.querySelector('#a-to-are-notification') as HTMLElement;
        expect(actionButton).toBeFalsy();
      });

      it('should not display are link when FEATURE_FLAG_PORTAL_ARE_ENABLED is disabled', () => {
        (window as any)['config'].featureFlags.FEATURE_FLAG_PORTAL_ARE_ENABLED = true;
        component.hasAreNotificationSenderRole = false;
        fixture.detectChanges();

        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();

        const actionButton = document.querySelector('#a-to-are-notification') as HTMLElement;
        expect(actionButton).toBeFalsy();
      });

      it('should show survstat link', () => {
        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();

        const actionButton = document.querySelector('#a-to-survstat') as HTMLElement;
        expect(actionButton).toBeTruthy();
      });

      it('should open survstat link in new tab when clicked', () => {
        const openSpy = vi.spyOn(window, 'open');

        const burgerButton = fixture.point.nativeElement.querySelector('#btn-burger-menu-in-navbar');
        burgerButton.click();
        fixture.detectChanges();

        const actionButton = document.querySelector('#a-to-survstat') as HTMLElement;
        expect(actionButton).toBeTruthy();
        actionButton.click();
        fixture.detectChanges();

        expect(openSpy).toHaveBeenCalledWith('https://go.gematik.de/demis-meldedaten', '_blank');
      });
    });

    describe('registration dialog behavior', () => {
      it('should show info dialog and skip registration when SPU id already exists', () => {
        const authService = fixture.point.injector.get(AuthService) as any;
        authService.getSPUId = () => 'spu-123';
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);
        const showFormDialogSpy = vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog');
        const oidcService = fixture.point.injector.get(OidcSecurityService);
        const forceRefreshSpy = vi.spyOn(oidcService, 'forceRefreshSession');
        component.openRegisterDialog();

        expect(showFormDialogSpy).toHaveBeenCalledTimes(1);
        expect(vi.mocked(showFormDialogSpy).mock.calls[0][0].title).toContain('Zugang bereits freigeschaltet');
        expect(forceRefreshSpy).not.toHaveBeenCalled();
      });

      it('should open register form and trigger session refresh on confirm', () => {
        const result = { surveillanceProgramUserId: 'id', zipCode: '12345' };
        const authService = fixture.point.injector.get(AuthService) as any;
        authService.getSPUId = () => undefined;
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);
        vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog').mockReturnValue(of(result as unknown as string | undefined));
        const oidcService = fixture.point.injector.get(OidcSecurityService);
        const forceRefreshSpy = vi.spyOn(oidcService, 'forceRefreshSession').mockReturnValue(of({} as any));
        component.openRegisterDialog();

        expect(forceRefreshSpy).toHaveBeenCalled();
      });

      it('should show success dialog when forceRefreshSession succeeds after registration', () => {
        const formResult = { surveillanceProgramUserId: 'abc', zipCode: '12345' };
        const authService = fixture.point.injector.get(AuthService) as any;
        // Initially no SPU ID, then after registration it should return one
        let spuIdValue: string | undefined = undefined;
        authService.getSPUId = () => spuIdValue;
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);

        let callCount = 0;
        const showFormDialogSpy = vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog').mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // After registration form is submitted, SPU ID becomes available
            spuIdValue = 'spu-123';
            return of(formResult as unknown as string | undefined);
          }
          return of(undefined as unknown as string | undefined);
        });

        const oidcService = fixture.point.injector.get(OidcSecurityService);
        vi.spyOn(oidcService, 'forceRefreshSession').mockReturnValue(of({} as any));

        component.openRegisterDialog();

        expect(showFormDialogSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Freischaltung erfolgreich' }));
      });

      it('should show partial success dialog when forceRefreshSession fails after registration', () => {
        const formResult = { surveillanceProgramUserId: 'abc', zipCode: '12345' };
        const authService = fixture.point.injector.get(AuthService) as any;
        authService.getSPUId = () => undefined;
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);

        let callCount = 0;
        const showFormDialogSpy = vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog').mockImplementation(() => {
          callCount++;
          if (callCount === 1) return of(formResult as unknown as string | undefined);
          return of(undefined as unknown as string | undefined);
        });

        const oidcService = fixture.point.injector.get(OidcSecurityService);
        vi.spyOn(oidcService, 'forceRefreshSession').mockReturnValue(throwError(() => new Error('refresh failed')));

        component.openRegisterDialog();

        expect(showFormDialogSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Freischaltung erfolgreich' }));
      });

      it('should not trigger forceRefreshSession when dialog is cancelled', () => {
        const authService = fixture.point.injector.get(AuthService) as any;
        authService.getSPUId = () => undefined;
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);
        vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog').mockReturnValue(defer(() => of(undefined as unknown as string | undefined)));
        const oidcService = fixture.point.injector.get(OidcSecurityService);
        const forceRefreshSpy = vi.spyOn(oidcService, 'forceRefreshSession');
        component.openRegisterDialog();

        expect(forceRefreshSpy).not.toHaveBeenCalled();
      });

      it('should set form errors when requestSurveillanceAccess returns 401', async () => {
        const authService = fixture.point.injector.get(AuthService) as any;
        authService.getSPUId = () => undefined;
        authService.getEncodedToken = () => 'test-token';
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);

        let capturedConfig: FormlyFormDialogProps | undefined;
        vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog').mockImplementation((config: FormlyFormDialogProps) => {
          capturedConfig = config;
          return of(undefined as unknown as string | undefined);
        });

        const httpClient = fixture.point.injector.get(HttpClient);
        vi.spyOn(httpClient, 'post').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })));

        component.openRegisterDialog();

        expect(capturedConfig).toBeDefined();
        expect(capturedConfig!.submitValidation).toBeDefined();

        const testData = { surveillanceProgramUserId: 'test-id', zipCode: '12345' };
        const mockFormGroup = {
          controls: {
            surveillanceProgramUserId: { setErrors: vi.fn() },
            zipCode: { setErrors: vi.fn() },
          },
        };
        const result = await capturedConfig!.submitValidation!(testData, mockFormGroup as any);

        expect(result).toBe(false);
        expect(mockFormGroup.controls.surveillanceProgramUserId.setErrors).toHaveBeenCalledWith({ submitValidation: true });
        expect(mockFormGroup.controls.zipCode.setErrors).toHaveBeenCalledWith({ submitValidation: true });
      });

      it('should close dialog and show technical error when requestSurveillanceAccess returns 500', async () => {
        const authService = fixture.point.injector.get(AuthService) as any;
        authService.getSPUId = () => undefined;
        authService.getEncodedToken = () => 'test-token';
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);

        let capturedConfig: FormlyFormDialogProps | undefined;
        const showFormlyFormDialogSpy = vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog').mockImplementation((config: FormlyFormDialogProps) => {
          capturedConfig = config;
          return of(undefined as unknown as string | undefined);
        });
        const closeDialogSpy = vi.spyOn(formlyFormDialogService, 'closeDialog');

        const httpClient = fixture.point.injector.get(HttpClient);
        vi.spyOn(httpClient, 'post').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })));

        component.openRegisterDialog();

        expect(capturedConfig).toBeDefined();
        expect(capturedConfig!.submitValidation).toBeDefined();

        const testData = { surveillanceProgramUserId: 'test-id', zipCode: '12345' };
        const result = await capturedConfig!.submitValidation!(testData, {} as any);

        expect(result).toBe(false);
        expect(closeDialogSpy).toHaveBeenCalled();
        expect(showFormlyFormDialogSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Freischaltung fehlgeschlagen' }));
      });

      it('should return isValid true when requestSurveillanceAccess succeeds', async () => {
        const authService = fixture.point.injector.get(AuthService) as any;
        authService.getSPUId = () => undefined;
        authService.getEncodedToken = () => 'test-token';
        const formlyFormDialogService = fixture.point.injector.get(FormlyFormDialogService);

        let capturedConfig: FormlyFormDialogProps | undefined;
        vi.spyOn(formlyFormDialogService, 'showFormlyFormDialog').mockImplementation((config: FormlyFormDialogProps) => {
          capturedConfig = config;
          return of(undefined as unknown as string | undefined);
        });

        const httpClient = fixture.point.injector.get(HttpClient);
        vi.spyOn(httpClient, 'post').mockReturnValue(of({ success: true }));

        component.openRegisterDialog();

        expect(capturedConfig).toBeDefined();
        expect(capturedConfig!.submitValidation).toBeDefined();

        const testData = { surveillanceProgramUserId: 'test-id', zipCode: '12345' };
        const result = await capturedConfig!.submitValidation!(testData, {} as any);

        expect(result).toBe(true);
      });
    });
  });
});
