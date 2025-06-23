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

import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { TypeGuardsService } from './type-guards.service';
import { environment } from 'src/environments/environment';

export const INFO_BANNERS_LOCAL_STORAGE_KEY = 'INFO_BANNERS_ALREADY_CLOSED';

/**
 * Service to manage the storage of banners that have already been closed by the user.
 * It uses local storage to persist the state across sessions.
 */
@Injectable({ providedIn: 'root' })
export class InfoBannerStorageService {
  private readonly logger = inject(NGXLogger);
  private readonly typeGuardsService = inject(TypeGuardsService);
  private readonly _bannersAlreadyClosed: WritableSignal<Set<string>>;
  readonly bannersAlreadyClosed: Signal<Set<string>>;

  constructor() {
    this._bannersAlreadyClosed = signal(this.fetchBannersAlreadyClosed());
    this.bannersAlreadyClosed = this._bannersAlreadyClosed.asReadonly();
  }

  /**
   * Checks, if there are any old banner ids stored in the local storage and removes them if they are not
   * present in the current environment's infoBanners.
   *
   * @param bannerIds  An array of banner IDs to be pruned.
   * @returns          An array of banner IDs that are still present in the current environment's infoBanners.
   */
  private pruneBannerIds(bannerIds: Set<string>): Set<string> {
    const prunedBannerIds = Array.from(bannerIds).filter(bannerId => environment.infoBanners.some(banner => banner.id === bannerId));
    localStorage.setItem(INFO_BANNERS_LOCAL_STORAGE_KEY, JSON.stringify(prunedBannerIds));
    this.logger.debug(`Pruned banner IDs: ${prunedBannerIds.join(', ')}`);
    return new Set(prunedBannerIds);
  }

  /**
   * Accesses the local storage of the browser to retrieve the list of banners that have already been closed.
   * If the data is not valid (not an array of strings), it resets the local storage item to an empty array.
   */
  private fetchBannersAlreadyClosed() {
    const storedData = localStorage.getItem(INFO_BANNERS_LOCAL_STORAGE_KEY);
    if (!storedData) {
      this.logger.debug(`No data found in localStorage for ${INFO_BANNERS_LOCAL_STORAGE_KEY}, initializing with empty array.`);
      localStorage.setItem(INFO_BANNERS_LOCAL_STORAGE_KEY, JSON.stringify([]));
      return new Set<string>();
    }
    const storedBanners = JSON.parse(storedData);
    if (this.typeGuardsService.isStringArray(storedBanners)) {
      return this.pruneBannerIds(new Set(storedBanners));
    } else {
      this.logger.warn(`Invalid data in localStorage for ${INFO_BANNERS_LOCAL_STORAGE_KEY}, resetting. `);
      localStorage.setItem(INFO_BANNERS_LOCAL_STORAGE_KEY, JSON.stringify([]));
      return new Set<string>();
    }
  }

  /**
   * Closes a banner by its ID and updates the local storage.
   *
   * @param bannerId The ID of the banner to be closed.
   */
  closeBanner(bannerId: string) {
    this._bannersAlreadyClosed.update(alreadyClosedBannerIds => alreadyClosedBannerIds.add(bannerId));
    localStorage.setItem(INFO_BANNERS_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(this._bannersAlreadyClosed())));
  }
}
