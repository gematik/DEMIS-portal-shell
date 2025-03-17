/*
 Copyright (c) 2025 gematik GmbH
 Licensed under the EUPL, Version 1.2 or - as soon they will be approved by
 the European Commission - subsequent versions of the EUPL (the "Licence");
 You may not use this work except in compliance with the Licence.
    You may obtain a copy of the Licence at:
    https://joinup.ec.europa.eu/software/page/eupl
        Unless required by applicable law or agreed to in writing, software
 distributed under the Licence is distributed on an "AS IS" basis,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the Licence for the specific language governing permissions and
 limitations under the Licence.
 */

import { WelcomeTileNewComponent, WelcomeTileNewConfig } from './welcome-tile-new.component';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';

describe('WelcomeTileNewComponent', () => {
  let fixture: MockedComponentFixture<WelcomeTileNewComponent, Partial<WelcomeTileNewComponent>>;
  let component: WelcomeTileNewComponent;

  beforeEach(() => MockBuilder(WelcomeTileNewComponent));

  const initConfig: WelcomeTileNewConfig = {
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
    fixture = MockRender(WelcomeTileNewComponent, { config: initConfig });
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
