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

import { describe, expect, it } from 'vitest';
import { DynamicEnvironment } from './dynamic-environment';

describe('DynamicEnvironment', () => {
  it('should provide defaults before configuration is loaded', () => {
    const environment = new DynamicEnvironment();

    expect(environment.isProduction).toBe(false);
    expect(environment.featureFlags).toEqual({});
    expect(environment.infoBanners).toEqual([]);
    expect(environment.stageIndicator).toBeUndefined();
    expect(environment.ngxLoggerConfig).toEqual(environment.defaultLoggerConfiguration);
  });

  it('should expose loaded configuration without sharing it between instances', () => {
    const environment = new DynamicEnvironment();
    const otherEnvironment = new DynamicEnvironment();
    const featureFlags = { FEATURE_FLAG_PORTAL_ARE_ENABLED: true };

    environment.setConfig({
      production: true,
      featureFlags,
      infoBanners: [{ id: 'test-banner', type: 'info', content: 'Test banner' }],
      stageIndicator: { content: 'Test stage' },
      ngxLoggerConfig: { level: 1, disableConsoleLogging: false, serverLogLevel: 5 },
    });

    expect(environment.isProduction).toBe(true);
    expect(environment.featureFlags).toBe(featureFlags);
    expect(environment.infoBanners).toEqual([{ id: 'test-banner', type: 'info', content: 'Test banner', closable: true, shownIn: 'all' }]);
    expect(environment.stageIndicator).toEqual({ content: 'Test stage', moreInfo: undefined, demisHomeLogoFile: 'DEMIS.svg' });
    expect(environment.ngxLoggerConfig).toEqual({ level: 1, disableConsoleLogging: false, serverLogLevel: 5 });
    expect(otherEnvironment.isProduction).toBe(false);
    expect(otherEnvironment.featureFlags).toEqual({});
  });
});
