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

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { FEATURE_FLAG_PORTAL_WELCOME_PAGE_A11Y, isNonNominalNotificationActivated } from '../shared/app-constants';
import { WelcomeTileConfig } from '../welcome/welcome.component';

@Component({
  selector: 'app-welcome-tile',
  imports: [CommonModule, MatCardModule, RouterModule, MatExpansionModule, MatButtonModule, MatIcon, A11yModule],
  templateUrl: './welcome-tile.component.html',
  styleUrl: './welcome-tile.component.scss',
})
export class WelcomeTileComponent {
  readonly config = input.required<WelcomeTileConfig>();
  readonly animated = input<boolean>(false);
  readonly contentHeight = input<string>();
  readonly isExpanded = input(false);
  readonly toggle = output<void>();
  readonly router = inject(Router);

  isTileExpandable(): boolean {
    const config = this.config();
    return !!config.subTiles && config.subTiles.length > 0;
  }

  handleTileClick(): void {
    if (FEATURE_FLAG_PORTAL_WELCOME_PAGE_A11Y()) {
      this.navigateTo(this.config().destinationRouterLink as string);
      return;
    }

    // To be removed once FEATURE_FLAG_PORTAL_WELCOME_PAGE_A11Y is removed
    if (this.isTileExpandable()) {
      this.toggle.emit();
    } else {
      this.navigateTo(this.config().destinationRouterLink as string);
    }
  }

  navigateTo(destination: string): void {
    this.router.navigateByUrl(destination);
  }

  getIconName(): string {
    if (!this.isTileExpandable()) {
      return 'chevron_right';
    }
    return this.isExpanded() ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  getIconType(): string {
    if (!this.isTileExpandable()) {
      return 'chevron-right-logo';
    }
    return this.isExpanded() ? 'chevron-up-logo' : 'chevron-down-logo';
  }

  protected readonly isNonNominalNotificationActivated = isNonNominalNotificationActivated;
  protected readonly FEATURE_FLAG_PORTAL_WELCOME_PAGE_A11Y = FEATURE_FLAG_PORTAL_WELCOME_PAGE_A11Y;
}
