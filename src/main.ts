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

import { enableProdMode, NgZone, provideAppInitializer, inject, importProvidersFrom } from '@angular/core';
import { start as singleSpaStart } from 'single-spa';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { OidcSecurityService, StsConfigStaticLoader, AbstractSecurityStorage, AuthModule, StsConfigLoader } from 'angular-auth-oidc-client';
import { KcConfigService } from 'src/app/services/kc-config.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IconLoaderService } from 'src/app/shared/services/icon-loader.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { LOCALE_ID_DE } from 'src/app/shared/common-utils';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from 'src/app/services/auth.interceptor';
import { KcStorageService } from 'src/app/services/kc-storage.service';
import { provideToastr } from 'ngx-toastr';
import { LoggerModule } from 'ngx-logger';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppComponent } from './app/app.component';

const authFactory = (configService: KcConfigService) => {
  const config = configService.getConfig();
  return new StsConfigStaticLoader(config);
};

export function initIconLoaderService(iconLoaderService: IconLoaderService) {
  return (): Promise<void> => {
    return iconLoaderService.init();
  };
}

singleSpaStart();

const appId = 'demis-notification-portal-mf-shell';
const PORTAL_CONFIG_ERROR: string = 'PORTAL_CONFIG_ERROR';

fetch(environment.pathToEnvironment)
  .then(response => response.json())
  .then(config => {
    (<any>window).config = config;

    sessionStorage.removeItem(PORTAL_CONFIG_ERROR);

    if (environment.isProduction) {
      enableProdMode();
    }

    bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(
          AuthModule.forRoot({
            loader: {
              provide: StsConfigLoader,
              useFactory: authFactory,
              deps: [KcConfigService],
            },
          }),
          LoggerModule.forRoot(environment.ngxLoggerConfig),
          AppRoutingModule
        ),
        provideToastr({
          positionClass: 'toast-bottom-right',
          preventDuplicates: true,
        }),
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
      .then(module => {
        const rootZone = module.injector.get(NgZone);
        const inner = (rootZone as any)['_inner'];

        if (inner?._properties) {
          inner._properties[appId] = true;
        }
      })
      .catch(err => console.error(err));
  });
