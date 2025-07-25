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

import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MaxHeightContentContainerComponent } from '@gematik/demis-portal-core-library';
import { AuthenticatedResult, OidcSecurityService } from 'angular-auth-oidc-client';
import { MockBuilder, MockedComponentFixture, MockRender, MockService } from 'ng-mocks';
import { NGXLogger } from 'ngx-logger';
import { NGXLoggerMock } from 'ngx-logger/testing';
import { BehaviorSubject, of } from 'rxjs';
import { TestSetup } from '../test/test-setup';
import { ComponentInputs } from '../test/utils/input-signal-types';
import { AppComponent } from './app.component';
import { DemisAppModule } from './app.module';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService } from './services';

// Mock component with automatic input handling
@Component({
  selector: 'gem-demis-max-height-content-container',
  template: '<ng-content></ng-content>',
  inputs: ['elementSelectorsToSubtract'], // Automatic input handling
})
class MockMaxHeightContentContainerComponent implements Partial<ComponentInputs<MaxHeightContentContainerComponent>> {
  // All InputSignals are automatically available as @Input properties
  // No manual type definition required!
}

describe('AppComponent', () => {
  let fixture: MockedComponentFixture<AppComponent, ComponentInputs<AppComponent>>;
  let component: AppComponent;

  const mockRouter = {
    events: of(new NavigationEnd(0, '', '')),
    routerState: {
      snapshot: {
        url: '/home',
      },
    },
  };

  beforeEach(() => ((window as any)['config'] = TestSetup.CONFIG));

  beforeEach(() =>
    MockBuilder(AppComponent)
      .keep(DemisAppModule)
      .replace(MaxHeightContentContainerComponent, MockMaxHeightContentContainerComponent)
      .mock(NavbarComponent)
      .mock(AuthService)
      .mock(JwtHelperService)
      .provide({ provide: Router, useValue: mockRouter })
      .provide({ provide: NGXLogger, useClass: NGXLoggerMock })
      .provide({
        provide: OidcSecurityService,
        useValue: {
          ...MockService(OidcSecurityService),
          isAuthenticated$: new BehaviorSubject<AuthenticatedResult>({
            isAuthenticated: false,
            allConfigsAuthenticated: [],
          }).asObservable(),
          checkSessionChanged$: new BehaviorSubject<boolean>(false).asObservable(),
        } as Partial<OidcSecurityService>,
      })
  );

  beforeEach(() => {
    fixture = MockRender(AppComponent);
    component = fixture.point.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'DEMIS-Meldeportal'`, () => {
    expect(component.title).toEqual('DEMIS-Meldeportal');
  });
});
