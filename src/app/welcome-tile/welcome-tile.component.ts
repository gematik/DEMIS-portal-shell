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
import { Component, computed, inject, Signal, signal, WritableSignal, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { WelcomeTileConfig } from '../welcome/welcome.component';
import { isNonNominalNotificationActivated } from '../shared/app-constants';

@Component({
  selector: 'app-welcome-tile',
  imports: [CommonModule, MatCardModule, RouterModule, MatButtonModule, MatIcon],
  templateUrl: './welcome-tile.component.html',
  styleUrl: './welcome-tile.component.scss',
})
export class WelcomeTileComponent {
  readonly config = input.required<WelcomeTileConfig>();
  readonly animated = input<boolean>(false);
  readonly contentHeight = input<string>();

  isExpanded: WritableSignal<boolean> = signal(false);
  isTileExpandable: Signal<boolean> = computed(() => {
    const config = this.config();
    return !!config.subTiles && config.subTiles.length > 0;
  });

  router = inject(Router);

  changeIsExpandedState(): void {
    this.isExpanded.update(prev => !prev);
  }

  handleTileClick(): void {
    if (this.isTileExpandable()) {
      this.changeIsExpandedState();
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
}
