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

import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockProvider } from 'ng-mocks';
import { NGXLogger } from 'ngx-logger';
import { INFO_BANNERS_LOCAL_STORAGE_KEY, InfoBannerStorageService } from './info-banner-storage.service';
import { TypeGuardsService } from './type-guards.service';
import { environment } from 'src/environments/environment';
import { InfoBannerConfig } from 'src/environments/dynamic-environment';

const TEST_INFO_BANNERS: InfoBannerConfig[] = [
  { id: 'id1', type: 'info', content: 'Banner 1', closable: true, shownIn: 'all' },
  { id: 'id2', type: 'info', content: 'Banner 2', closable: true, shownIn: 'all' },
];

describe('InfoBannerStorageService', () => {
  let service: InfoBannerStorageService;

  beforeEach(() => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue(TEST_INFO_BANNERS);
  });

  describe('With empty localStorage', () => {
    beforeEach(() => {
      //Clean up localStorage before each test
      localStorage.removeItem(INFO_BANNERS_LOCAL_STORAGE_KEY);
      return MockBuilder(InfoBannerStorageService).provide(TypeGuardsService).provide(MockProvider(NGXLogger));
    });

    beforeEach(() => {
      service = TestBed.inject(InfoBannerStorageService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty array if localStorage is empty', () => {
      const banners = service.bannersAlreadyClosed();
      expect(banners).toEqual(new Set<string>([]));
      expect(localStorage.getItem(INFO_BANNERS_LOCAL_STORAGE_KEY)).toBe(JSON.stringify([]));
    });

    it('should add bannerId to closed banners and update localStorage when closeBanner is called', () => {
      const bannerId = 'id1';
      service.closeBanner(bannerId);

      // The Set should now contain the closed bannerId
      expect(service.bannersAlreadyClosed()).toEqual(new Set([bannerId]));
      expect(localStorage.getItem(INFO_BANNERS_LOCAL_STORAGE_KEY)).toBe(`["${bannerId}"]`);
    });

    it('should not duplicate bannerIds when closeBanner is called multiple times with the same id', () => {
      const bannerId = 'id1';
      service.closeBanner(bannerId);
      service.closeBanner(bannerId);

      // The Set should still only contain one instance of the bannerId
      expect(service.bannersAlreadyClosed()).toEqual(new Set([bannerId]));
      expect(localStorage.getItem(INFO_BANNERS_LOCAL_STORAGE_KEY)).toBe(`["${bannerId}"]`);
    });

    it('should add multiple bannerIds when closeBanner is called with different ids', () => {
      const bannerIds = ['id1', 'id2'];
      service.closeBanner(bannerIds[0]);
      service.closeBanner(bannerIds[1]);

      expect(service.bannersAlreadyClosed()).toEqual(new Set(['id1', 'id2']));
      expect(localStorage.getItem(INFO_BANNERS_LOCAL_STORAGE_KEY)).toBe(`["${bannerIds[0]}","${bannerIds[1]}"]`);
    });

    afterEach(() => {
      // Clean up localStorage after each test
      localStorage.removeItem(INFO_BANNERS_LOCAL_STORAGE_KEY);
    });
  });

  describe('With populated valid localStorage', () => {
    beforeEach(() => {
      const stored = ['id1', 'id2'];
      localStorage.setItem(INFO_BANNERS_LOCAL_STORAGE_KEY, JSON.stringify(stored));
      return MockBuilder(InfoBannerStorageService).provide(TypeGuardsService).provide(MockProvider(NGXLogger));
    });

    it('should initialize with stored banners if valid', () => {
      const stored = ['id1', 'id2'];
      localStorage.setItem(INFO_BANNERS_LOCAL_STORAGE_KEY, JSON.stringify(stored));

      // Recreate service to trigger constructor logic
      service = TestBed.inject(InfoBannerStorageService);
      expect(service.bannersAlreadyClosed()).toEqual(new Set(stored));
    });

    afterEach(() => {
      // Clean up localStorage after each test
      localStorage.removeItem(INFO_BANNERS_LOCAL_STORAGE_KEY);
    });
  });

  describe('With populated invalid localStorage', () => {
    beforeEach(() => {
      const stored = { foo: 'bar' }; // Invalid data, not an array of strings
      localStorage.setItem(INFO_BANNERS_LOCAL_STORAGE_KEY, JSON.stringify(stored));
      return MockBuilder(InfoBannerStorageService).provide(TypeGuardsService).provide(MockProvider(NGXLogger));
    });

    it('should reset localStorage if stored data is invalid', () => {
      const warnSpy = spyOn(TestBed.inject(NGXLogger), 'warn');
      service = TestBed.inject(InfoBannerStorageService);
      expect(service.bannersAlreadyClosed()).toEqual(new Set<string>([]));
      expect(warnSpy).toHaveBeenCalled();
      expect(localStorage.getItem(INFO_BANNERS_LOCAL_STORAGE_KEY)).toBe(JSON.stringify([]));
    });

    afterEach(() => {
      // Clean up localStorage after each test
      localStorage.removeItem(INFO_BANNERS_LOCAL_STORAGE_KEY);
    });
  });
});
