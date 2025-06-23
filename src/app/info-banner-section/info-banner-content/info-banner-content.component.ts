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
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InfoBannerStorageService } from 'src/app/services/info-banner-storage.service';
import { MarkdownService } from 'src/app/services/markdown.service';
import { InfoBannerConfig, InfoBannerType } from 'src/environments/dynamic-environment';

@Component({
  selector: 'app-info-banner-content',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './info-banner-content.component.html',
  styleUrl: './info-banner-content.component.scss',
})
export class InfoBannerContentComponent {
  @Input({ required: true }) private config!: InfoBannerConfig;
  private readonly markdownService = inject(MarkdownService);
  private readonly infoBannerStorageService = inject(InfoBannerStorageService);

  get bannerId(): string {
    return this.config.id;
  }

  get bannerType(): InfoBannerType {
    return this.config.type;
  }

  get bannerIcon(): string {
    return this.bannerType === 'warning' ? 'error' : 'info';
  }

  get bannerContent(): string {
    return this.markdownService.convertToSanitizedHtml(this.config.content); // Convert markdown content to sanitized HTML
  }

  get isClosable(): boolean {
    return this.config.closable;
  }

  get moreInfoUrl(): string | undefined {
    return this.config.moreInfo;
  }

  get hasActions(): boolean {
    return this.isClosable || !!this.moreInfoUrl || false; // Check if the banner has any actions, either closable or more info link
  }

  onCloseBanner() {
    this.infoBannerStorageService.closeBanner(this.bannerId);
  }
}
