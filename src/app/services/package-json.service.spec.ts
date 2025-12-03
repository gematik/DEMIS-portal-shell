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

import { TestBed } from '@angular/core/testing';

import { PackageJsonService } from './package-json.service';
import packageInfo from '../../../package.json';

describe('PackageJsonService', () => {
  let service: PackageJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PackageJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have expected version info', () => {
    expect(service.version).toBe(packageInfo.version);
  });

  it('should have a fallback, if no version info is available', () => {
    service['packageJson'] = { ...packageInfo };
    delete (service as any)['packageJson'].version;
    expect(service.version).not.toBe(packageInfo.version);
    expect(service.version).toBe('0.0.0');
  });
});
