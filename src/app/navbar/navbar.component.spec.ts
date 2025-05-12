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

import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MockBuilder, MockedComponentFixture, MockInstance, MockRender, MockService, ngMocks } from 'ng-mocks';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { TestSetup } from '../../test/test-setup';
import { AuthService } from '../services';
import { NavbarComponent } from './navbar.component';
import { PackageJsonService } from '../services/package-json.service';

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

  const getLink = (id: string) => {
    const selector = `#${id}`;
    return fixture.point.nativeElement.querySelector(selector);
  };

  beforeEach(() => {
    return MockBuilder([NavbarComponent, RouterModule, MatTabsModule, MatToolbarModule, MatDividerModule, MatMenuModule, PackageJsonService])
      .provide({
        provide: AuthService,
        useValue: { ...MockService(AuthService), $tokenChanged: tokenChangedSubject, $isAuthenticated: authSubject } as AuthService,
      })
      .mock(Router)
      .mock(ActivatedRoute)
      .mock(MatIconModule);
  });

  beforeEach(() => {
    MockInstance(Router, 'events', routerEvents);
  });

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  //Test if menu-entries are correctly shown depending on user roles
  TestSetup.JWT_ROLES.forEach(parameter => {
    it(`check if role ${parameter.roles.join(',')} shows tile ${parameter.link}`, () => {
      createComponent();
      spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake(role => parameter.roles.includes(role));
      ngMocks.flushTestBed();
      createComponent();
      const link = getLink(parameter.link);
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
        const link = getLink(parameter.link);
        expect(!!link).toBeFalsy();
      }
    });
  });

  ['igs-sequence-data-sender', 'igs-sequence-data-sender-fasta-only'].forEach(presentRole => {
    it(`Should show link a-to-sequence-notification if only ${presentRole} is present`, () => {
      createComponent();
      spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake(
        (role: string) => presentRole === role || 'igs-notification-data-sender' === role
      );
      ngMocks.flushTestBed();
      createComponent();
      const link = getLink(`a-to-sequence-notification`);
      expect(!!link).toBeTruthy();
    });
  });
});
