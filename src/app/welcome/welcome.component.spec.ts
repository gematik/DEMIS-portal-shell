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

import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MessageDialogService } from '@gematik/demis-portal-core-library';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { MockBuilder, MockedComponentFixture, MockRender, MockService, ngMocks } from 'ng-mocks';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TestSetup } from '../../test/test-setup';
import { AuthService } from '../services/auth.service';
import { EqualHeightService } from '../shared/services/equal-height.service';
import { WelcomeTileComponent } from '../welcome-tile/welcome-tile.component';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let fixture: MockedComponentFixture<WelcomeComponent>;
  let component: WelcomeComponent;
  const tokenChangedSubject = new Subject<void>();
  const isAuthenticatedSubject = new BehaviorSubject(true);

  const createComponent = () => {
    fixture = MockRender(WelcomeComponent);
    component = fixture.point.componentInstance;
  };

  const getTile = (tile: string) => {
    const selector = `#${tile}`;
    return fixture.point.nativeElement.querySelector(selector);
  };

  const errorSpy = jasmine.createSpy('error');

  beforeEach(() =>
    MockBuilder([WelcomeComponent, WelcomeTileComponent])
      .mock(NGXLogger)
      .mock(EqualHeightService)
      .mock(MessageDialogService, { error: errorSpy })
      .mock(MatCardModule)
      .mock(MatButtonModule)
      .provide({
        provide: AuthService,
        useValue: {
          ...MockService(AuthService),
          $tokenChanged: tokenChangedSubject,
          $isAuthenticated: isAuthenticatedSubject,
        } as AuthService,
      })
      .provide({ provide: OidcSecurityService, useValue: MockService(OidcSecurityService) })
  );
  describe('Tests for tiles in old design', () => {
    beforeEach(() => {
      let config = TestSetup.CONFIG;
      config.featureFlags.FEATURE_FLAG_NEW_STARTPAGE_DESIGN = false;
      (window as any)['config'] = config;
    });

    it('should call adjustTileContentHeights on window resize', () => {
      createComponent();
      const contentContainers = document.getElementById(component.tileContainerId)?.getElementsByClassName('tile-content-paragraphs');
      expect(contentContainers).toBeTruthy();
      const adjustElementParentHeightsSpy = spyOn(TestBed.inject(EqualHeightService), 'adjustElementParentHeights');
      window.dispatchEvent(new Event('resize'));
      expect(adjustElementParentHeightsSpy).toHaveBeenCalledWith(contentContainers as HTMLCollectionOf<Element>);
    });

    it('should silently do nothing on window resize, when there are no tiles to adjust', () => {
      createComponent();
      const contentContainers = document.getElementById(component.tileContainerId)?.getElementsByTagName('app-welcome-tile') as HTMLCollectionOf<Element>;
      for (let index = contentContainers.length - 1; index >= 0; index--) {
        contentContainers[index].parentNode?.removeChild(contentContainers[index]);
      }
      const adjustElementParentHeightsSpy = spyOn(TestBed.inject(EqualHeightService), 'adjustElementParentHeights');
      window.dispatchEvent(new Event('resize'));
      expect(adjustElementParentHeightsSpy).not.toHaveBeenCalled();
    });
    it('should use correct logo paths old', () => {
      createComponent();
      console.log('TestSetup.CONFIG:', TestSetup.CONFIG);
      const pathogenTile = component.tiles.find(tile => tile.config.id === 'pathogen');
      expect(pathogenTile?.config.logoImage?.src).toBe('assets/images/erregernachweis_mikroskop.svg');

      const bedOccupancyTile = component.tiles.find(tile => tile.config.id === 'bed-occupancy');
      expect(bedOccupancyTile?.config.logoImage?.src).toBe('assets/images/Krankenhaus-Bett.svg');

      const diseaseTile = component.tiles.find(tile => tile.config.id === 'disease');
      expect(diseaseTile?.config.logoImage?.src).toBe('assets/images/hospitalisierung.png');
    });
  });
  describe('Tests for tiles in new design', () => {
    beforeEach(() => {
      let config = TestSetup.CONFIG;
      config.featureFlags.FEATURE_FLAG_NEW_STARTPAGE_DESIGN = true;
      (window as any)['config'] = config;
    });

    it('should create', () => {
      createComponent();
      spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').and.returnValue(of(''));
      expect(component).toBeTruthy();
    });
    it('should use correct logo paths', () => {
      createComponent();
      const pathogenTile = component.tiles.find(tile => tile.config.id === 'pathogen');
      expect(pathogenTile?.config.logoImage?.src).toBe('assets/images/pathogen-new.svg');

      const bedOccupancyTile = component.tiles.find(tile => tile.config.id === 'bed-occupancy');
      expect(bedOccupancyTile?.config.logoImage?.src).toBe('assets/images/bedoccupancy-new.svg');

      const diseaseTile = component.tiles.find(tile => tile.config.id === 'disease');
      expect(diseaseTile?.config.logoImage?.src).toBe('assets/images/disease-new.svg');
    });
    TestSetup.JWT_ROLES.forEach(parameter => {
      it(`check if role(s) ${parameter.roles.join(',')} shows tile ${parameter.tile}`, () => {
        createComponent();
        spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').and.returnValue(of(''));
        fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
        spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake((role: string) => parameter.roles.includes(role));
        fixture.point.injector.get(AuthService).$tokenChanged.next();
        ngMocks.flushTestBed();
        createComponent();
        const tile = getTile(parameter.tile);
        expect(!!tile).toBeTruthy();
      });

      it(`${!parameter.doNegativeTest ? 'deactivated -- ' : ''}check if tile ${parameter.tile} is removed if role(s) ${parameter.roles.join(
        ','
      )} is missing`, () => {
        if (parameter.doNegativeTest) {
          createComponent();
          spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').and.returnValue(of(''));
          spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.returnValue(false);
          fixture.point.injector.get(AuthService).$tokenChanged.next();
          ngMocks.flushTestBed();
          createComponent();
          const tile = getTile(parameter.tile);
          expect(!!tile).toBeFalsy();
        }
      });
    });

    ['igs-sequence-data-sender', 'igs-sequence-data-sender-fasta-only'].forEach(presentRole => {
      it(`Should show title welcome-tile-sequence-notification if only ${presentRole} is present`, () => {
        createComponent();
        spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').and.returnValue(of(''));
        fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
        spyOn(fixture.point.injector.get(AuthService), 'checkRole').and.callFake(
          (role: string) => presentRole === role || 'igs-notification-data-sender' === role
        );
        fixture.point.injector.get(AuthService).$tokenChanged.next();
        ngMocks.flushTestBed();
        createComponent();
        const tile = getTile(`welcome-tile-sequence-notification`);
        expect(!!tile).toBeTruthy();
      });
    });
    it('should check portal config when there is a PORTAL_CONFIG_ERROR in session storage', () => {
      spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'PORTAL_CONFIG_ERROR') {
          return 'something went wrong';
        }
        throw new Error('no key');
      });
      createComponent();
      expect(errorSpy.calls.count()).withContext('should have been called once').toBe(1);
      const args = errorSpy.calls.argsFor(0);
      expect(args[0].errorTitle()).toBe('Fehler beim Laden der Konfiguration');
      expect(args[0].errors().length).toBe(1);
      expect(args[0].errors()[0].message).toBe(
        'Achtung: Die Konfiguration konnte nicht geladen werden. Bitte die Anwendung neu starten. Falls der Fehler weiterhin auftritt, kontaktieren Sie bitte den Support.'
      );
    });
  });
});
