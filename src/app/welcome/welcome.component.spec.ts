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

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MaxHeightContentContainerComponent, MessageDialogService } from '@gematik/demis-portal-core-library';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { MockBuilder, MockedComponentFixture, MockRender, MockService, ngMocks } from 'ng-mocks';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AppConstants } from '../shared/app-constants';
import { WelcomeTileComponent } from '../welcome-tile/welcome-tile.component';
import { WelcomeComponent } from './welcome.component';
import { TestFixtures } from '../../test/test-fixtures';

describe('WelcomeComponent', () => {
  let fixture: MockedComponentFixture<WelcomeComponent>;
  let component: WelcomeComponent;
  const tokenChangedSubject = new Subject<void>();
  const isAuthenticatedSubject = new BehaviorSubject(true);

  const createComponent = () => {
    fixture = MockRender(WelcomeComponent);
    component = fixture.point.componentInstance;
  };

  const getElementById = (tile: string) => {
    const selector = `#${tile}`;
    return fixture.point.nativeElement.querySelector(selector);
  };

  const errorSpy = vi.fn();

  beforeEach(() =>
    MockBuilder([WelcomeComponent, WelcomeTileComponent])
      .keep(MaxHeightContentContainerComponent)
      .keep(NgTemplateOutlet)
      .mock(NGXLogger)
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
  describe('Tests for tiles', () => {
    beforeEach(() => {
      let config = TestFixtures.CONFIG;
      (window as any)['config'] = config;
    });

    it('should create', () => {
      createComponent();
      vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
      expect(component).toBeTruthy();
    });

    it('should use correct logo paths', () => {
      createComponent();
      const pathogenTile = component.tiles.find(tile => tile.config.id === 'pathogen');
      expect(pathogenTile?.config.logoImage?.src).toBe('assets/images/pathogen.svg');

      const bedOccupancyTile = component.tiles.find(tile => tile.config.id === 'bed-occupancy');
      expect(bedOccupancyTile?.config.logoImage?.src).toBe('assets/images/bedoccupancy.svg');

      const diseaseTile = component.tiles.find(tile => tile.config.id === 'disease');
      expect(diseaseTile?.config.logoImage?.src).toBe('assets/images/disease.svg');
    });

    it('should open a expandable tile, then open another expandable tile and close the first one', () => {
      createComponent();
      vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
      fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;

      vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation((role: string) => {
        return [
          AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER,
          AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER,
          AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER,
        ].includes(role as AppConstants.Roles);
      });

      fixture.point.injector.get(AuthService).$tokenChanged.next();
      ngMocks.flushTestBed();
      createComponent();

      // Make sure we have at least two tiles to test with
      expect(
        component.tiles.filter(t => t.renderingCondition && Array.isArray(t.config.subTiles) && t.config.subTiles.length > 0).length
      ).toBeGreaterThanOrEqual(2);

      // Initially no tile should be expanded
      expect(component.expandedTileIndex()).toBeNull();

      const nonNominalTileIndex = component.tiles.findIndex(tile => tile.config.id === 'non-nominal');
      const pathogenTileIndex = component.tiles.findIndex(
        tile => Array.isArray(tile.config.subTiles) && tile.config.subTiles.length > 0 && tile.config.id === 'pathogen'
      );

      // Expand the non-nominal tile
      component.changeExpandedStateForTile(nonNominalTileIndex);
      fixture.detectChanges();
      expect(component.expandedTileIndex()).toBe(nonNominalTileIndex);

      // Expand the pathogen tile
      component.changeExpandedStateForTile(pathogenTileIndex);
      fixture.detectChanges();

      // The non-nominal tile should be closed and only the second should be expanded
      expect(component.expandedTileIndex()).toBe(pathogenTileIndex);
      expect(component.expandedTileIndex()).not.toBe(nonNominalTileIndex);
    });

    TestFixtures.JWT_ROLES.forEach(parameter => {
      it(`check if role(s) ${parameter.roles.join(',')} shows tile ${parameter.tile}`, () => {
        createComponent();
        vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
        fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
        vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation((role: string) =>
          parameter.roles.includes(role as AppConstants.Roles)
        );
        fixture.point.injector.get(AuthService).$tokenChanged.next();
        ngMocks.flushTestBed();
        createComponent();
        const tile = getElementById(parameter.tile);
        expect(!!tile).toBeTruthy();
      });

      it(`${!parameter.doNegativeTest ? 'deactivated -- ' : ''}check if tile ${parameter.tile} is removed if role(s) ${parameter.roles.join(',')} is missing`, () => {
        if (parameter.doNegativeTest) {
          createComponent();
          vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
          vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockReturnValue(false);
          fixture.point.injector.get(AuthService).$tokenChanged.next();
          ngMocks.flushTestBed();
          createComponent();
          const tile = getElementById(parameter.tile);
          expect(!!tile).toBeFalsy();
        }
      });
    });

    [AppConstants.Roles.IGS_SEQUENCE_DATA_SENDER, AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER_FASTA_ONLY].forEach(presentRole => {
      it(`Should show title welcome-tile-sequence-notification if only ${presentRole} is present`, () => {
        createComponent();
        vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
        fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
        vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(
          (role: string) => presentRole === role || AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER === role
        );
        fixture.point.injector.get(AuthService).$tokenChanged.next();
        ngMocks.flushTestBed();
        createComponent();
        const tile = getElementById(`welcome-tile-sequence-notification`);
        expect(!!tile).toBeTruthy();
      });
    });

    it('should check portal config when there is a PORTAL_CONFIG_ERROR in session storage', () => {
      vi.spyOn(sessionStorage, 'getItem').mockImplementation((key: string) => {
        if (key === 'PORTAL_CONFIG_ERROR') {
          return 'something went wrong';
        }
        throw new Error('no key');
      });
      createComponent();
      expect(vi.mocked(errorSpy).mock.calls.length, 'should have been called once').toBe(1);
      const args = vi.mocked(errorSpy).mock.calls[0];
      expect(args[0].errorTitle()).toBe('Fehler beim Laden der Konfiguration');
      expect(args[0].errors().length).toBe(1);
      expect(args[0].errors()[0].message).toBe(
        'Achtung: Die Konfiguration konnte nicht geladen werden. Bitte die Anwendung neu starten. Falls der Fehler weiterhin auftritt, kontaktieren Sie bitte den Support.'
      );
    });
  });

  describe('test tiles with subtiles', () => {
    beforeAll(() => {
      (window as any)['config'].featureFlags.FEATURE_FLAG_PORTAL_ARE_ENABLED = true;
    });

    TestFixtures.JWT_ROLES_EXPANDABLE_TILES.forEach(({ id, roles, tile, subTiles, doNegativeTest, requireAllRoles }) => {
      it(`should show tile ${tile} and its subtiles when user has roles ${roles.join(', ')}`, async () => {
        createComponent();
        vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
        fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
        vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation((role: string) => roles.includes(role as AppConstants.Roles));

        fixture.point.injector.get(AuthService).$tokenChanged.next();

        ngMocks.flushTestBed();
        createComponent();

        await fixture.whenStable();
        fixture.detectChanges();

        const tileElement = getElementById(tile);
        expect(!!tileElement).toBeTruthy();

        const tileIndex = component.tiles.findIndex(tile => Array.isArray(tile.config.subTiles) && tile.config.subTiles.length > 0 && tile.config.id === id);

        // Expand the tile, workaround because click doesn't work
        component.changeExpandedStateForTile(tileIndex);
        fixture.detectChanges();

        // verify each subtile is present
        subTiles.forEach(({ tile: subTileId }) => {
          const subTileElement = getElementById(subTileId);
          expect(subTileElement).toBeTruthy();
        });
      });

      // Negative test: For tiles that require roles, test that it doesn't show when no roles are present
      if (doNegativeTest) {
        it(`should not show tile ${tile} when user does not have required roles`, async () => {
          createComponent();
          vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
          fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
          vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockReturnValue(false);
          fixture.point.injector.get(AuthService).$tokenChanged.next();

          ngMocks.flushTestBed();
          createComponent();

          await fixture.whenStable();
          fixture.detectChanges();

          const tileElement = getElementById(tile);
          expect(tileElement).toBeFalsy();
        });
      }

      // For tiles that require all roles, test that it doesn't show when only one role is present
      if (requireAllRoles && roles.length > 1) {
        roles.forEach(requiredRole => {
          it(`should not show tile ${tile} when only ${requiredRole} role is present`, async () => {
            createComponent();
            vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
            fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
            vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation((role: string) => role === requiredRole);
            fixture.point.injector.get(AuthService).$tokenChanged.next();

            ngMocks.flushTestBed();
            createComponent();

            await fixture.whenStable();
            fixture.detectChanges();

            const tileElement = getElementById(tile);
            expect(tileElement).toBeFalsy();
          });
        });
      }
    });
  });

  describe('non-nominal follow-up feature flag tests', () => {
    beforeEach(() => {
      (window as any)['config'] = JSON.parse(JSON.stringify(TestFixtures.CONFIG));
    });

    it('should show non-nominal follow-up sub-tiles when FEATURE_FLAG_FOLLOW_UP_7_3 is enabled', async () => {
      createComponent();
      vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
      fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
      vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      fixture.point.injector.get(AuthService).$tokenChanged.next();
      ngMocks.flushTestBed();
      createComponent();

      await fixture.whenStable();
      fixture.detectChanges();

      const nonNominalTileIndex = component.tiles.findIndex(tile => tile.config.id === 'non-nominal');
      component.changeExpandedStateForTile(nonNominalTileIndex);
      fixture.detectChanges();

      const pathogenFollowUp = getElementById('sub-tile-button-pathogen-non-nominal-follow-up');
      expect(pathogenFollowUp).toBeTruthy();
      const diseaseFollowUp = getElementById('sub-tile-button-disease-non-nominal-follow-up');
      expect(diseaseFollowUp).toBeTruthy();
    });

    it('should not show non-nominal follow-up sub-tiles when FEATURE_FLAG_FOLLOW_UP_7_3 is disabled', async () => {
      // TODO remove test when FEATURE_FLAG_FOLLOW_UP_7_3 is removed
      (window as any)['config'].featureFlags.FEATURE_FLAG_FOLLOW_UP_7_3 = false;
      createComponent();
      vi.spyOn(fixture.point.injector.get(OidcSecurityService), 'getAccessToken').mockReturnValue(of(''));
      fixture.point.injector.get(AuthService).$isAuthenticated = isAuthenticatedSubject;
      vi.spyOn(fixture.point.injector.get(AuthService), 'checkRole').mockImplementation(
        (role: string) =>
          role === AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER || role === AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER
      );
      fixture.point.injector.get(AuthService).$tokenChanged.next();
      ngMocks.flushTestBed();
      createComponent();

      await fixture.whenStable();
      fixture.detectChanges();

      const nonNominalTileIndex = component.tiles.findIndex(tile => tile.config.id === 'non-nominal');
      component.changeExpandedStateForTile(nonNominalTileIndex);
      fixture.detectChanges();

      const pathogenFollowUp = getElementById('sub-tile-button-pathogen-non-nominal-follow-up');
      expect(pathogenFollowUp).toBeFalsy();
      const diseaseFollowUp = getElementById('sub-tile-button-disease-non-nominal-follow-up');
      expect(diseaseFollowUp).toBeFalsy();

      // non-nominal sub-tiles without follow-up should still be present
      const pathogenNonNominal = getElementById('sub-tile-button-pathogen-non-nominal');
      expect(pathogenNonNominal).toBeTruthy();
      const diseaseNonNominal = getElementById('sub-tile-button-disease-non-nominal');
      expect(diseaseNonNominal).toBeTruthy();
    });
  });
});
