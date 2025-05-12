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

import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IconLoaderService } from './icon-loader.service';
import { MockBuilder } from 'ng-mocks';

describe('IconLoaderService', () => {
  let service: IconLoaderService;
  let matIconRegistrySpy: jasmine.Spy;
  let domSanitizerSpy: jasmine.Spy;

  beforeEach(() => MockBuilder(IconLoaderService).mock(MatIconRegistry).mock(DomSanitizer));

  beforeEach(() => {
    service = TestBed.inject(IconLoaderService);
    matIconRegistrySpy = spyOn(TestBed.inject(MatIconRegistry), 'addSvgIcon');
    domSanitizerSpy = spyOn(TestBed.inject(DomSanitizer), 'bypassSecurityTrustResourceUrl').and.callFake((url: string) => url);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize icons', async () => {
    const icons = ['arrow-right', 'arrow-left', 'demis', 'user', 'pin', 'pin-filled', 'checkmark-outline', 'circle-dash', 'send'];
    const expectedParams = new Map<string, string>([
      ['arrow-right', `${(service as any)['ICON_FOLDER_PATH']}arrow--right.svg`],
      ['arrow-left', `${(service as any)['ICON_FOLDER_PATH']}arrow--left.svg`],
      ['demis', `${(service as any)['ICON_FOLDER_PATH']}demis.svg`],
      ['user', `${(service as any)['ICON_FOLDER_PATH']}user.svg`],
      ['pin', `${(service as any)['ICON_FOLDER_PATH']}pin.svg`],
      ['pin-filled', `${(service as any)['ICON_FOLDER_PATH']}pin_filled.svg`],
      ['checkmark-outline', `${(service as any)['ICON_FOLDER_PATH']}checkmark-outline.svg`],
      ['circle-dash', `${(service as any)['ICON_FOLDER_PATH']}circle-dash.svg`],
      ['send', `${(service as any)['ICON_FOLDER_PATH']}send-button.svg`],
    ]);

    await service.init();

    icons.forEach(icon => {
      expect(matIconRegistrySpy).toHaveBeenCalledWith(icon, expectedParams.get(icon));
    });
  });
});
