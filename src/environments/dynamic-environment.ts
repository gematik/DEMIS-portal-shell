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

import { HttpHeaders } from '@angular/common/http';
import { NgxLoggerLevel } from 'ngx-logger';
import { AppConstants } from 'src/app/shared/app-constants';

declare let window: any;

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
  FEATURE_FLAG_NON_NOMINAL_NOTIFICATION?: boolean;
  FEATURE_FLAG_PORTAL_INFOBANNER?: boolean;
  FEATURE_FLAG_FOLLOW_UP_NOTIFICATION_PORTAL_PATHOGEN?: boolean;
  FEATURE_FLAG_FOLLOW_UP_NOTIFICATION_PORTAL_DISEASE?: boolean;
  FEATURE_FLAG_PORTAL_HEADER_FOOTER?: boolean;
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
  infoBanners: EnvFileInfoBannerConfig[];
  stageIndicator: EnvFileStageIndicator;
  ngxLoggerConfig: NgxLoggerConfig;
}

interface KeyCloakConfig {
  realm: string;
  url: string | undefined;
  clientId: string | undefined;
  clientIdInternet: string | undefined;
  meldungDNS: string | undefined;
}

/**
 * Configuration for the info banners shown in the application.
 */
export interface EnvFileInfoBannerConfig {
  // UUID of the banner
  id: string;
  // choosable type of the banner for general information banners
  type: 'info' | 'warning';
  // the content formatted as Markdown
  content: string;
  // defines the pages where the banner is shown
  shownIn?: 'all' | 'shell' | AppConstants.PathSegments[];
  // datetime as ISO String (in the format YYYY-MM-DDThh:mm:ssZ); defines the date and time the shell starts to show the banner
  startsAt?: string;
  // datetime as ISO String (in the format YYYY-MM-DDThh:mm:ssZ); defines the date and time (inclusive) the shell ends to show the banner
  endsAt?: string;
  // URL to more information
  moreInfo?: string;
  // is the banner closable
  closable?: boolean;
}

/**
 * Combnined type for all possible banner types.
 *
 * This type is derived from the EnvFileInfoBannerConfig interface and enhanced by special banner types, that are distinguishable,
 * but not choosbale via stage config.
 */
export declare type InfoBannerType = (Pick<EnvFileInfoBannerConfig, 'type'> extends { type: infer U } ? U : never) | 'stage-indicator';

// Intermediate types to do type manipulations with and derive the final UiInfoBannerConfig type
declare type _InfoBannerConfigDefaultables = Pick<EnvFileInfoBannerConfig, 'closable' | 'shownIn'>;
declare type _InfoBannerConfigWithoutDefaultables = Omit<EnvFileInfoBannerConfig, keyof _InfoBannerConfigDefaultables | 'type'>;
declare type _InfoBannerConfigOverwriteExtension = { [Property in keyof _InfoBannerConfigDefaultables]-?: _InfoBannerConfigDefaultables[Property] };
declare type _CompoundType = _InfoBannerConfigWithoutDefaultables &
  _InfoBannerConfigOverwriteExtension & {
    type: InfoBannerType;
  };

/**
 * InfoBannerConfig is a type that transforms the EnvFileInfoBannerConfig interface
 * by ensuring that the 'closable' and 'shownIn' properties are required.
 * This is done by using type manipulations offered by TypeScript.
 */
export declare type InfoBannerConfig = { [Property in keyof _CompoundType]: _CompoundType[Property] };

/**
 * Interface for the stage indicator configuration.
 */
export interface EnvFileStageIndicator {
  // content of the stage indicator banner, formatted as Markdown
  content: string;
  // URL to more information
  moreInfo?: string;
  // the file name of the DEMIS logo to be shown on the home button in the navbar
  demisHomeLogoFile?: string;
}

declare type _StageIndicatorPropertiesToBeRequired = Pick<EnvFileStageIndicator, 'content' | 'demisHomeLogoFile'>;
declare type _StageIndicatorPropertiesToBeOptional = Pick<EnvFileStageIndicator, 'moreInfo'>;
declare type _StageIndicatorRequired = { [Property in keyof _StageIndicatorPropertiesToBeRequired]-?: _StageIndicatorPropertiesToBeRequired[Property] };
declare type _StageIndicator = _StageIndicatorRequired & _StageIndicatorPropertiesToBeOptional;

/**
 * StageIndicator is a type that transforms the EnvFileStageIndicator interface
 * by ensuring that all properties are required.
 * This is done by using type manipulations offered by TypeScript.
 */
export declare type StageIndicator = { [Property in keyof _StageIndicator]: _StageIndicator[Property] };

export class DynamicEnvironment {
  public headers: HttpHeaders;
  public local: boolean = false;
  public pathToEnvironment: string = 'environment.json';
  public bypassComfortClient: boolean = false;

  constructor() {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
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

  public get issuersDemisPortal(): string[] | undefined {
    return this.identityProviderDemisPortal?.issuers;
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

  public get featureFlags(): any {
    return this.config?.featureFlags;
  }

  /**
   * Returns the configuration for the info banners.
   */
  public get infoBanners(): InfoBannerConfig[] {
    if (this.config?.infoBanners) {
      return this.config?.infoBanners.map(
        bannerConfig =>
          ({
            ...bannerConfig,
            closable: bannerConfig.closable ?? true,
            shownIn: bannerConfig.shownIn ?? 'all',
          }) as InfoBannerConfig
      );
    }

    return [];
  }

  /**
   * Returns the configuration for the stage indicator.
   */
  public get stageIndicator(): StageIndicator | undefined {
    if (this.config?.stageIndicator?.content) {
      return {
        content: this.config?.stageIndicator?.content,
        moreInfo: this.config?.stageIndicator?.moreInfo,
        demisHomeLogoFile: this.config?.stageIndicator?.demisHomeLogoFile || 'DEMIS.svg',
      };
    }

    return undefined;
  }

  private get identityProviderDemis(): IdentityProvider | undefined {
    const demisTenant = this.identityProviders?.filter(provider => provider.tenant === 'demis' && !provider.hasOwnProperty('clientId'));
    return demisTenant ? demisTenant[0] : undefined;
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
