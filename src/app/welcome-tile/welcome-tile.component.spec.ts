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
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ComponentInputs } from '../../test/utils/input-signal-types';

describe('WelcomeTileComponent', () => {
  let fixture: MockedComponentFixture<WelcomeTileComponent, ComponentInputs<WelcomeTileComponent>>;
  let component: WelcomeTileComponent;

  let router: Router;

  beforeEach(() => {
    return MockBuilder(WelcomeTileComponent).provide({
      provide: Router,
      useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') },
    });
  });

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
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial config', () => {
    expect(component.config().id).toBe(initConfig.id);
    expect(component.config().titleTextRows).toEqual(initConfig.titleTextRows);
    expect(component.config().tooltip).toBe(initConfig.tooltip);
    expect(component.config().destinationRouterLink).toBe(initConfig.destinationRouterLink);
    expect(component.config().logoImage).toEqual(initConfig.logoImage);
    expect(component.config().contentParagraphs).toEqual(initConfig.contentParagraphs);
    expect(component.config().buttonLabel).toBe(initConfig.buttonLabel);
  });

  describe('handleTileClick', () => {
    it('should emit toggle event when tile is expandable', () => {
      spyOn(component, 'isTileExpandable').and.returnValue(true);
      spyOn(component.toggle, 'emit');

      component.handleTileClick();

      expect(component.toggle.emit).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should navigate to destination when tile is not expandable', () => {
      spyOn(component, 'isTileExpandable').and.returnValue(false);
      component.config().destinationRouterLink = '/test-route';

      component.handleTileClick();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/test-route');
    });
  });

  describe('navigateTo', () => {
    it('should navigate to the given destination', () => {
      const destination = '/subtile-route';

      component.navigateTo(destination);

      expect(router.navigateByUrl).toHaveBeenCalledWith(destination);
    });
  });

  describe('getIconName', () => {
    it('should return chevron_right when tile is not expandable', () => {
      const fixture = MockRender(WelcomeTileComponent, {
        config: initConfig,
        isExpanded: false,
      });
      const component = fixture.point.componentInstance;
      spyOn(component, 'isTileExpandable').and.returnValue(false);

      expect(component.getIconName()).toBe('chevron_right');
    });

    it('should return keyboard_arrow_up when tile is expandable and expanded', () => {
      const fixture = MockRender(WelcomeTileComponent, {
        config: initConfig,
        isExpanded: true,
      });
      const component = fixture.point.componentInstance;
      spyOn(component, 'isTileExpandable').and.returnValue(true);

      expect(component.getIconName()).toBe('keyboard_arrow_up');
    });

    it('should return keyboard_arrow_down when tile is expandable and not expanded', () => {
      const fixture = MockRender(WelcomeTileComponent, {
        config: initConfig,
        isExpanded: false,
      });
      const component = fixture.point.componentInstance;
      spyOn(component, 'isTileExpandable').and.returnValue(true);

      expect(component.getIconName()).toBe('keyboard_arrow_down');
    });
  });

  describe('getIconType', () => {
    it('should return chevron-right-logo when tile is not expandable', () => {
      const fixture = MockRender(WelcomeTileComponent, {
        config: initConfig,
        isExpanded: false,
      });
      const component = fixture.point.componentInstance;
      spyOn(component, 'isTileExpandable').and.returnValue(false);

      expect(component.getIconType()).toBe('chevron-right-logo');
    });

    it('should return chevron-up-logo when tile is expandable and expanded', () => {
      const fixture = MockRender(WelcomeTileComponent, {
        config: initConfig,
        isExpanded: true,
      });
      const component = fixture.point.componentInstance;
      spyOn(component, 'isTileExpandable').and.returnValue(true);

      expect(component.getIconType()).toBe('chevron-up-logo');
    });

    it('should return chevron-down-logo when tile is expandable and not expanded', () => {
      const fixture = MockRender(WelcomeTileComponent, {
        config: initConfig,
        isExpanded: false,
      });
      const component = fixture.point.componentInstance;
      spyOn(component, 'isTileExpandable').and.returnValue(true);

      expect(component.getIconType()).toBe('chevron-down-logo');
    });
  });
});
