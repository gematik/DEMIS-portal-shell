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
import { AfterViewInit, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule, UrlTree } from '@angular/router';
import { WelcomeTileConfig } from '../welcome/welcome.component';

@Component({
  selector: 'app-welcome-tile',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, MatButtonModule],
  templateUrl: './welcome-tile.component.html',
  styleUrl: './welcome-tile.component.scss',
})
export class WelcomeTileComponent implements AfterViewInit {
  @Input({ required: true }) config: WelcomeTileConfig;
  @Input() animated: boolean = false;
  @Input() contentHeight?: string;
  @Output() tileViewInitialized = new EventEmitter<void>();

  router = inject(Router);

  ngAfterViewInit(): void {
    // This is done, so that the parent component can react to the initialization of the tile view
    this.tileViewInitialized.emit();
  }
}
