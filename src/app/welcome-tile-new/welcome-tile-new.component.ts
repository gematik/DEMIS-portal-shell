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

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule, UrlTree } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

declare type LogoImage = {
  src: string;
  alt: string;
};

export declare type WelcomeTileNewConfig = {
  id: string;
  titleTextRows: string[];
  tooltip: string;
  destinationRouterLink: string | UrlTree;
  logoImage: LogoImage;
  contentParagraphs: string[];
  buttonLabel: string;
};

@Component({
  selector: 'app-welcome-tile-new',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, MatButtonModule, MatIcon],
  templateUrl: './welcome-tile-new.component.html',
  styleUrl: './welcome-tile-new.component.scss',
})
export class WelcomeTileNewComponent implements AfterViewInit {
  @Input({ required: true }) config: WelcomeTileNewConfig;
  @Input() animated: boolean = false;
  @Input() contentHeight?: string;
  @Output() tileViewInitialized = new EventEmitter<void>();

  router = inject(Router);

  ngAfterViewInit(): void {
    // This is done, so that the parent component can react to the initialization of the tile view
    this.tileViewInitialized.emit();
  }
}
