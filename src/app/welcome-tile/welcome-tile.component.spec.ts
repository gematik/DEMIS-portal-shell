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

import { WelcomeTileComponent } from './welcome-tile.component';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { WelcomeTileConfig } from '../welcome/welcome.component';

describe('WelcomeTileComponent', () => {
  let fixture: MockedComponentFixture<WelcomeTileComponent, Partial<WelcomeTileComponent>>;
  let component: WelcomeTileComponent;

  beforeEach(() => MockBuilder(WelcomeTileComponent));

  const initConfig: WelcomeTileConfig = {
    id: 'test-id',
    titleTextRows: ['test-', 'title'],
    tooltip: 'test-tooltip',
    destinationRouterLink: 'test-link',
    logoImage: {
      src: 'test-src',
      alt: 'test-alt',
    },
    contentParagraphs: ['test-', 'content'],
    buttonLabel: 'test-button',
  };

  beforeEach(() => {
    fixture = MockRender(WelcomeTileComponent, { config: initConfig });
    component = fixture.point.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial config', () => {
    expect(component.config.id).toBe(initConfig.id);
    expect(component.config.titleTextRows).toBe(initConfig.titleTextRows);
    expect(component.config.tooltip).toBe(initConfig.tooltip);
    expect(component.config.destinationRouterLink).toBe(initConfig.destinationRouterLink);
    expect(component.config.logoImage).toBe(initConfig.logoImage);
    expect(component.config.contentParagraphs).toBe(initConfig.contentParagraphs);
    expect(component.config.buttonLabel).toBe(initConfig.buttonLabel);
  });
});
