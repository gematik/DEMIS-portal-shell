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

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { LoggerModule } from 'ngx-logger';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppComponent } from 'src/app/app.component';
import { NavbarComponent } from 'src/app/navbar/navbar.component';
import { LOCALE_ID_DE } from 'src/app/shared/common-utils';
import { IconLoaderService } from 'src/app/shared/services/icon-loader.service';
import { environment } from 'src/environments/environment';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MaxHeightContentContainerComponent } from '@gematik/demis-portal-core-library';
import { AbstractSecurityStorage, AuthModule, OidcSecurityService, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';
import { AuthInterceptor } from 'src/app/services/auth.interceptor';
import { AuthService } from 'src/app/services/auth.service';
import { KcConfigService } from 'src/app/services/kc-config.service';
import { KcStorageService } from 'src/app/services/kc-storage.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { NgOptimizedImage } from '@angular/common';
import { InfoBannerSectionComponent } from './info-banner-section/info-banner-section.component';
import { WelcomeTileComponent } from './welcome-tile/welcome-tile.component';

export function initIconLoaderService(iconLoaderService: IconLoaderService) {
  return (): Promise<void> => {
    return iconLoaderService.init();
  };
}

const authFactory = (configService: KcConfigService) => {
  const config = configService.getConfig();
  return new StsConfigStaticLoader(config);
};

@NgModule({
  declarations: [AppComponent, NavbarComponent],
  bootstrap: [AppComponent],
  imports: [
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    AuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: authFactory,
        deps: [KcConfigService],
      },
    }),
    LoggerModule.forRoot(environment.defaultNgxLoggerConfig),
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatTabsModule,
    WelcomeTileComponent,
    MaxHeightContentContainerComponent,
    NgOptimizedImage,
    InfoBannerSectionComponent,
  ],
  providers: [
    OidcSecurityService,
    KcConfigService,
    LocalStorageService,
    AuthService,
    JwtHelperService,
    IconLoaderService,
    { provide: MAT_DATE_LOCALE, useValue: LOCALE_ID_DE },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: AbstractSecurityStorage,
      useClass: KcStorageService,
    },
    provideAppInitializer(() => {
      const initializerFn = initIconLoaderService(inject(IconLoaderService));
      return initializerFn();
    }),
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class DemisAppModule {}
