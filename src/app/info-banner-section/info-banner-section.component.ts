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

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { InfoBannerStorageService } from 'src/app/services/info-banner-storage.service';
import { NavigationStateStore } from 'src/app/services/navigation-state.service';
import { AppConstants } from 'src/app/shared/app-constants';
import { InfoBannerConfig } from 'src/environments/dynamic-environment';
import { environment } from 'src/environments/environment';
import { TypeGuardsService } from '../services/type-guards.service';
import { InfoBannerContentComponent } from './info-banner-content/info-banner-content.component';

/**
 * InfoBannersComponent is responsible for displaying informational banners in the application.
 * It retrieves banner configurations from the environment, processes them, and displays them
 * based on their visibility conditions such as closability, time validity, and page context.
 */
@Component({
  selector: 'app-info-banner-section',
  standalone: true,
  imports: [CommonModule, MatDividerModule, InfoBannerContentComponent],
  templateUrl: './info-banner-section.component.html',
  styleUrl: './info-banner-section.component.scss',
})
export class InfoBannerSectionComponent {
  private readonly infoBannerStorageService = inject(InfoBannerStorageService);
  private readonly navigationStateStore = inject(NavigationStateStore);
  private readonly typeGuardsService = inject(TypeGuardsService);

  /**
   * Returns the list of info banner configurations from the environment.
   *
   * Each banner configuration is extended with a default value for 'closable'.
   * If 'closable' is not defined in the configuration, it defaults to true.
   *
   * Furthermore, the content of each banner is converted from markdown to sanitized HTML.
   */
  get infoBannerConfigs() {
    const alreadyClosedBanners = this.infoBannerStorageService.bannersAlreadyClosed();
    const activeUrl = this.navigationStateStore.lastNavigationEnd()?.urlAfterRedirects || '';
    const activeInfoBanners = environment.infoBanners
      // filtering of the banners by closed state
      .filter(uiBannerConfig => {
        // Make sure the banner is always shown, when it is not closable
        if (!uiBannerConfig.closable) {
          return true;
        }

        // Make sure the banner has not been closed before
        if (Array.from(alreadyClosedBanners).includes(uiBannerConfig.id)) {
          return false;
        }

        // Show the banner, if it hasn't been closed before
        return true;
      })
      // time based filtering of the banners
      .filter(uiBannerConfig => {
        const now = new Date();
        const startsAt = uiBannerConfig.startsAt ? new Date(uiBannerConfig.startsAt) : now;
        const endsAt = uiBannerConfig.endsAt ? new Date(uiBannerConfig.endsAt) : now;

        if (startsAt <= now && endsAt >= now) {
          return true;
        }
        return false;
      })
      // positional filtering of the banners
      .filter(uiBannerConfig => {
        // If the banner is shown on all pages, it is always shown
        if (uiBannerConfig.shownIn === 'all') {
          return true;
        }

        // If the banner is shown in the shell, it is always shown
        if (uiBannerConfig.shownIn === 'shell') {
          return Object.values(AppConstants.ShellPathSegments).some(segment => activeUrl.substring(1).startsWith(segment));
        }

        // Otherwise, check if the current path segment is included in the shownIn array
        if (this.typeGuardsService.isStringArray(uiBannerConfig.shownIn)) {
          return uiBannerConfig.shownIn.some(segment => activeUrl.substring(1).startsWith(segment));
        }

        // If no conditions match, do not show the banner
        return false;
      });

    return activeInfoBanners;
  }

  /**
   * Returns the configuration for the stage indicator banner.
   * If the environment has a stage indicator configured, it returns an InfoBannerConfig object, respectively.
   */
  get stageIndicatorBannerConfig() {
    return environment.stageIndicator
      ? ({
          id: 'demis-portal-stage-indicator',
          type: 'stage-indicator',
          content: environment.stageIndicator.content,
          shownIn: 'all',
          closable: false,
          moreInfo: environment.stageIndicator.moreInfo,
        } as InfoBannerConfig)
      : undefined;
  }

  /**
   * Returns the compound type of the banner section.
   * If any banner is of type 'warning', the compound type will be 'warning'.
   * Otherwise, it will be 'info'.
   * This is used to determine the overall styling of the banner section.
   */
  get compoundType() {
    return this.infoBannerConfigs.some(config => config.type === 'warning') ? 'warning' : 'info';
  }
}
