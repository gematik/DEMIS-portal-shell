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

import { Mock, MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { AppComponent } from 'src/app/app.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { DemisAppModule } from 'src/app/app.module';

describe('Shell - Integration Tests', () => {
  let component: AppComponent;
  let fixture: MockedComponentFixture<AppComponent>;
  let loader: HarnessLoader;

  beforeEach(() => MockBuilder([AppComponent, DemisAppModule, AppRoutingModule]));

  beforeEach(() => {
    fixture = MockRender(AppComponent);
    component = fixture.point.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
