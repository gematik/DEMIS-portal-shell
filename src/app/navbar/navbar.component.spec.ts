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
    For additional notes and disclaimer from gematik and in case of changes by gematik,
    find details in the "Readme" file.
 */

import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MockBuilder, MockedComponentFixture, MockInstance, MockProvider, MockRender, MockService, ngMocks } from 'ng-mocks';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { TestSetup } from '../../test/test-setup';
import { AuthService } from '../services';
import { NavbarComponent } from './navbar.component';
import { PackageJsonService } from '../services/package-json.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppConstants } from '../shared/app-constants';
import { InfoBannerSectionComponent } from '../info-banner-section/info-banner-section.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';

describe('Navbar Test', () => {
  let component: NavbarComponent;
  let fixture: MockedComponentFixture<NavbarComponent>;
  const tokenChangedSubject = new Subject<void>();
  const authSubject = new BehaviorSubject(true);
  const routerEvents = new ReplaySubject<NavigationEnd>(1);
  MockInstance.scope('case');

  (window as any)['config'] = TestSetup.CONFIG;

  const createComponent = () => {
    fixture = MockRender(NavbarComponent);
    component = fixture.point.componentInstance;
  };

  const getElementbyId = (id: string) => {
    const selector = `#${id}`;
    return fixture.point.nativeElement.querySelector(selector);
  };

  const mockRouter = {
    events: routerEvents,
    routerState: {
      snapshot: {
        url: '',
      },
    },
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
    createUrlTree: jasmine.createSpy('createUrlTree'),
    navigate: jasmine.createSpy('navigate'),
    serializeUrl: jasmine.createSpy('serializeUrl').and.callFake((urlTree: any) => urlTree),
  };

  beforeEach(() => {
    return MockBuilder(NavbarComponent)
      .keep(RouterModule)
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
      .provide({ provide: Router, useValue: mockRouter })
      .mock(ActivatedRoute)
      .mock(MatIconModule)
      .mock(InfoBannerSectionComponent);
  });

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  // Test if menu-entries are correctly shown depending on user roles
  TestSetup.JWT_ROLES.forEach(parameter => {
    it(`check if role ${parameter.roles.join(',')} shows menu entry ${parameter.link}`, () => {
      createComponent();
      spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake(role => parameter.roles.includes(role as AppConstants.Roles));
      ngMocks.flushTestBed();
      createComponent();
      const link = getElementbyId(parameter.link);
      expect(!!link).toBeTruthy();
    });

    it(`${!parameter.doNegativeTest ? 'deactivated -- ' : ''}check if tile ${parameter.link} is removed if role ${parameter.roles.join(
      ','
    )} is missing`, () => {
      if (parameter.doNegativeTest) {
        createComponent();
        spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake(() => false);
        ngMocks.flushTestBed();
        createComponent();
        const link = getElementbyId(parameter.link);
        expect(!!link).toBeFalsy();
      }
    });
  });

  [AppConstants.Roles.IGS_SEQUENCE_DATA_SENDER, AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER_FASTA_ONLY].forEach(presentRole => {
    it(`Should show link a-to-sequence-notification if only ${presentRole} is present`, () => {
      createComponent();
      spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake(
        (role: string) => presentRole === role || AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER === role
      );
      ngMocks.flushTestBed();
      createComponent();
      const link = getElementbyId(`a-to-sequence-notification`);
      expect(!!link).toBeTruthy();
    });
  });

  it('should display the disease menu items', async () => {
    createComponent();
    spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake((role: string) => AppConstants.Roles.DISEASE_NOTIFICATION_SENDER === role);
    ngMocks.flushTestBed();
    createComponent();

    const button = fixture.point.nativeElement.querySelector('#btn-disease');
    button.click();
    fixture.detectChanges();

    const menuItemFollowUp = document.querySelector('#a-to-disease-follow-up') as HTMLElement;
    expect(menuItemFollowUp).toBeTruthy();
    const menuItemNominal = document.querySelector('#a-to-disease-nominal') as HTMLElement;
    expect(menuItemNominal).toBeTruthy();
  });

  it('should display the disease non-nominal menu item and navigate to the correct route on click', async () => {
    createComponent();
    const authService = fixture.point.injector.get(AuthService);
    spyOn(authService, 'checkRole').and.callFake(
      (role: string) =>
        role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
    );
    ngMocks.flushTestBed();
    createComponent();

    const router = fixture.point.injector.get(Router);

    const button = fixture.point.nativeElement.querySelector('#btn-non-nominal');
    button.click();
    fixture.detectChanges();

    const menuItem = document.querySelector('#a-to-disease-non-nominal') as HTMLElement;
    expect(menuItem).toBeTruthy();

    menuItem.click();
    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/disease-notification/7.3/non-nominal');
  });
  it('should display the pathogen menu items', async () => {
    createComponent();
    spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake((role: string) => AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER === role);
    ngMocks.flushTestBed();
    createComponent();

    const button = fixture.point.nativeElement.querySelector('#btn-pathogen');
    button.click();
    fixture.detectChanges();

    const menuItemFollowUp = document.querySelector('#a-to-pathogen-follow-up') as HTMLElement;
    expect(menuItemFollowUp).toBeTruthy();
    const menuItemNominal = document.querySelector('#a-to-pathogen-nominal') as HTMLElement;
    expect(menuItemNominal).toBeTruthy();
  });

  it('should have no active tab when initially loaded', () => {
    createComponent();
    fixture.detectChanges();

    mockRouter.routerState.snapshot.url = '';
    routerEvents.next(new NavigationEnd(1, '', ''));
    fixture.detectChanges();

    expect(component.activeTab).toEqual('');
    expect(component.isPathogenTabActive).toBeFalse();
    expect(component.isDiseaseTabActive).toBeFalse();
    expect(component.isNonNominalTabActive).toBeFalse();
  });

  it('should set pathogen tab as active when navigating to pathogen path', () => {
    createComponent();
    fixture.detectChanges();

    const pathogenPath = AppConstants.Tabs.PATHOGEN;

    mockRouter.routerState.snapshot.url = '/' + pathogenPath;
    routerEvents.next(new NavigationEnd(1, pathogenPath, pathogenPath));
    fixture.detectChanges();

    expect(component.activeTab).toEqual(pathogenPath);
    expect(component.isPathogenTabActive).toBeTrue();
    expect(component.isDiseaseTabActive).toBeFalse();
    expect(component.isNonNominalTabActive).toBeFalse();
  });
  it('should set disease tab as active when navigating to pathogen path', () => {
    createComponent();
    fixture.detectChanges();

    const diseasePath = AppConstants.Tabs.DISEASE;

    mockRouter.routerState.snapshot.url = '/' + diseasePath;
    routerEvents.next(new NavigationEnd(1, diseasePath, diseasePath));
    fixture.detectChanges();

    expect(component.activeTab).toEqual(diseasePath);
    expect(component.isDiseaseTabActive).toBeTrue();
    expect(component.isPathogenTabActive).toBeFalse();
    expect(component.isNonNominalTabActive).toBeFalse();
  });

  it('should set pathogen non-nominal tab as active when navigating to pathogen non-nominal path', () => {
    createComponent();
    fixture.detectChanges();

    const pathogenNonNominalPath = AppConstants.PathSegments.NON_NOMINAL;

    mockRouter.routerState.snapshot.url = '/' + pathogenNonNominalPath;
    routerEvents.next(new NavigationEnd(2, pathogenNonNominalPath, pathogenNonNominalPath));
    fixture.detectChanges();

    expect(component.activeTab).toEqual(pathogenNonNominalPath);
    expect(component.isPathogenTabActive).toBeFalse();
    expect(component.isNonNominalTabActive).toBeTrue();
  });

  it('should blur all elements with class navbar-menu-btn', () => {
    createComponent();
    const btn1 = document.createElement('button');
    btn1.classList.add('navbar-menu-btn');
    const btn2 = document.createElement('button');
    btn2.classList.add('navbar-menu-btn');

    fixture.point.nativeElement.appendChild(btn1);
    fixture.point.nativeElement.appendChild(btn2);

    const spy1 = spyOn(btn1, 'blur');
    const spy2 = spyOn(btn2, 'blur');

    component.blurActiveMenuButtons();

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it('should not throw if an element lacks a blur function', () => {
    createComponent();
    const div = document.createElement('div');
    div.classList.add('navbar-menu-btn');
    (div as any).blur = undefined;
    fixture.point.nativeElement.appendChild(div);

    expect(() => component.blurActiveMenuButtons()).not.toThrow();

    div.remove();
  });
});
