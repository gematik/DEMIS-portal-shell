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

import { AccessibilityStatementComponent } from './accessibility-statement.component';
import { MockBuilder, MockedComponentFixture, MockRender, MockService } from 'ng-mocks';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from '../services';
import { Subject } from 'rxjs';
import { MaxHeightContentContainerComponent } from '@gematik/demis-portal-core-library';
import { FooterComponent } from '../footer/footer.component';

describe('AccessibilityStatementComponent', () => {
  let fixture: MockedComponentFixture<AccessibilityStatementComponent>;
  let component: AccessibilityStatementComponent;
  const tokenChangedSubject = new Subject<void>();

  beforeEach(() =>
    MockBuilder(AccessibilityStatementComponent)
      .keep(MaxHeightContentContainerComponent)
      .keep(FooterComponent)
      .mock(NGXLogger)
      .provide({
        provide: AuthService,
        useValue: {
          ...MockService(AuthService),
          $tokenChanged: tokenChangedSubject,
        } as AuthService,
      })
  );

  beforeEach(() => {
    fixture = MockRender(AccessibilityStatementComponent);
    component = fixture.point.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
