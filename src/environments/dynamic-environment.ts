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

import { AuthType } from 'src/app/shared/models/notifications/auth/enums/auth-type.enum';
import { HttpHeaders } from '@angular/common/http';
import { NgxLoggerLevel } from 'ngx-logger';

declare let window: any;

export type SmcbAuth = {
  host: string;
  client_id: string | undefined;
  realm: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  nonce: string;
};

interface IdentityProvider {
  baseUrl: string;
  tenant: string;
  clientId: string;
  clientIdInternet: string;
  issuers: string[];
  meldungDNS: string;
}

interface NgxLoggerConfig {
  level: number;
  disableConsoleLogging: boolean;
  serverLogLevel: number;
}

export interface FeatureFlags {
  CONFIG_TOKEN_INJECTION_ENABLED?: boolean;
  FEATURE_FLAG_NEW_STARTPAGE_DESIGN?: boolean;
}

interface GatewayPaths {
  laboratory: string;
  hospitalization: string;
  bedOccupancy: string;
  hospitalLocations: string;
  pathogen: string;
}

interface IgsPaths {
  sequenceFileUpload: string;
  sequenceFileDelete: string;
  sequenceNotification: string;
}

export interface GatewayConfiguration {
  production: boolean;
  pathToGateway: string;
  gatewayPaths: GatewayPaths;
  igsPaths: IgsPaths;
  identityProviders: IdentityProvider[];
  featureFlags: FeatureFlags;
  ngxLoggerConfig: NgxLoggerConfig;
}

interface KeyCloakConfig {
  realm: string;
  url: string | undefined;
  clientId: string | undefined;
  clientIdInternet: string | undefined;
  meldungDNS: string | undefined;
}

interface ComfortClient extends SmcbAuth {
  keycloakInitOptionLocation: string;
  keycloak: KeyCloakConfig;
  authType: AuthType;
  smcbURL: string;
}

export class DynamicEnvironment {
  public headers: HttpHeaders;
  public local: boolean = false;
  public pathToEnvironment: string = 'environment.json';
  public pathToIgsService: string = 'PATH TO IGS SERVICE NOT DEFINED';
  public bypassComfortClient: boolean = false;
  public production = false;

  constructor() {
    this.headers = new HttpHeaders({
      'app-key': 'bd2aca3d5b433868146e41f89ccbd1c7',
      'Content-Type': 'application/json',
      'x-real-ip': '123.123.123.123',
    });
  }

  private get config(): GatewayConfiguration {
    return window.config;
  }

  public get isLocal(): boolean {
    return this.local;
  }

  public get isProduction(): boolean {
    return !!this.config?.production;
  }

  public get ngxLoggerConfig(): NgxLoggerConfig {
    return this.config?.ngxLoggerConfig ? this.config?.ngxLoggerConfig : this.defaultNgxLoggerConfig;
  }

  public get defaultNgxLoggerConfig(): NgxLoggerConfig {
    return {
      level: NgxLoggerLevel.OFF,
      disableConsoleLogging: true,
      serverLogLevel: NgxLoggerLevel.OFF,
    };
  }

  public get pathToGateway(): string {
    return this.config?.pathToGateway;
  }

  public get pathToLaboratory(): string {
    return this.gatewayPaths?.laboratory;
  }

  public get pathToHospitalization(): string {
    return this.gatewayPaths?.hospitalization;
  }

  public get pathToBedOccupancy(): string {
    return this.gatewayPaths?.bedOccupancy;
  }

  public get pathToHospitalLocations(): string {
    return this.gatewayPaths?.hospitalLocations;
  }

  public get pathToPathogen(): string {
    return this.gatewayPaths?.pathogen;
  }

  // identity providers

  private get identityProviders(): IdentityProvider[] {
    return this.config?.identityProviders;
  }

  public get issuersDemis(): string[] | undefined {
    return this.identityProviderDemis?.issuers;
  }

  public get issuersIbm(): string[] | undefined {
    return this.identityProviderIbm?.issuers;
  }

  public get issuersDemisPortal(): string[] | undefined {
    return this.identityProviderDemisPortal?.issuers;
  }

  public get baseOauthUrl(): string | undefined {
    return this.issuersIbm ? `${this.issuersIbm[0]}/protocol/openid-connect` : undefined;
  }

  // configs

  public get keycloakConfigGematik(): KeyCloakConfig {
    return {
      realm: 'gematik',
      url: this.gematikIssuer?.split('/realm')[0],
      clientId: this.identityProviderIbm?.clientId,
      clientIdInternet: undefined,
      meldungDNS: undefined,
    };
  }

  // abe stand 6.10.2023 working Config for providers- delete when keyclock adapted
  /**
   * use the LocalDev-config Interface
   *
   */
  public get keycloakConfigPortal(): KeyCloakConfig {
    return {
      realm: this.demisPortalIssuer?.split('realms/')[1] ?? '',
      url: this.demisPortalIssuer?.split('/realms')[0],
      clientId: this.identityProviderDemisPortal?.clientId,
      clientIdInternet: this.identityProviderDemisPortal?.clientIdInternet,
      meldungDNS: this.identityProviderDemisPortal?.meldungDNS,
    };
  }

  public get smcbAuth(): SmcbAuth {
    return {
      host: 'id.certify.demo.ubirch.com',
      client_id: this.keycloakConfigGematik?.clientId,
      realm: this.keycloakConfigGematik?.realm,
      redirect_uri: `${this.gematikIssuer}/.well-known/openid-configuration`,
      response_type: 'token',
      scope: 'openid',
      nonce: 'random-value',
    };
  }

  public get cardsPath(): string {
    return this.comfortClient.smcbURL + '/Institution/Cards';
  }

  public get comfortClient(): ComfortClient {
    return {
      keycloakInitOptionLocation: './assets/keycloak/silent-check-sso.html',
      keycloak: this.keycloakConfigGematik,
      authType: AuthType.SMCB,
      smcbURL: `/api`,
      ...this.smcbAuth,
    };
  }

  public get featureFlags(): any {
    return this.config.featureFlags;
  }

  private get identityProviderDemis(): IdentityProvider | undefined {
    const demisTenant = this.identityProviders?.filter(provider => provider.tenant === 'demis' && !provider.hasOwnProperty('clientId'));
    return demisTenant ? demisTenant[0] : undefined;
  }

  private get identityProviderIbm(): IdentityProvider | undefined {
    const ibmTenant = this.identityProviders?.filter(provider => provider.tenant === 'ibm');
    return ibmTenant ? ibmTenant[0] : undefined;
  }

  private get gematikIssuer(): string | undefined {
    const gematikIssuer = this.issuersIbm?.filter(l => l.includes('gematik'));
    return gematikIssuer ? gematikIssuer[0] : undefined;
  }

  private get identityProviderDemisPortal(): IdentityProvider | undefined {
    const demisPortalTenant = this.identityProviders?.filter(provider => provider.tenant === 'demis-portal');
    return demisPortalTenant ? demisPortalTenant[0] : undefined;
  }

  private get demisPortalIssuer(): string | undefined {
    const demisPortalIssuer = this.issuersDemisPortal?.filter(l => l.includes('PORTAL'));
    return demisPortalIssuer ? demisPortalIssuer[0] : undefined;
  }

  private get gatewayPaths(): GatewayPaths {
    return this.config?.gatewayPaths;
  }
}
