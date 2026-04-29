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

import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FEATURE_FLAG_FOOTER_LINKS_CORRECTION, FEATURE_FLAG_PORTAL_ACCESSIBILITY, FEATURE_FLAG_PORTAL_FOOTER_LOGO } from '../shared/app-constants';
import { AuthService } from '../services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
})
export class FooterComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly unsubscriber = new Subject<void>();

  readonly FEATURE_FLAG_PORTAL_ACCESSIBILITY = FEATURE_FLAG_PORTAL_ACCESSIBILITY;
  readonly FEATURE_FLAG_FOOTER_LINKS_CORRECTION = FEATURE_FLAG_FOOTER_LINKS_CORRECTION;
  readonly FEATURE_FLAG_PORTAL_FOOTER_LOGO = FEATURE_FLAG_PORTAL_FOOTER_LOGO;

  readonly userInfo = signal({ isAuthenticated: false, username: '' });
  readonly isAuthenticated = computed(() => this.userInfo().isAuthenticated);

  ngOnInit() {
    this.authService.$tokenChanged.pipe(takeUntil(this.unsubscriber)).subscribe(() => this.refreshUserInfo());
    this.refreshUserInfo();
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }

  private refreshUserInfo() {
    this.userInfo.set({
      isAuthenticated: this.authService.isAuthenticated(),
      username: this.authService.getUsername() ?? 'unknown',
    });
  }
}
