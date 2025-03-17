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

import { TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { EqualHeightService } from './equal-height.service';
import { MockBuilder } from 'ng-mocks';

describe('EqualHeightService', () => {
  let service: EqualHeightService;
  let logger: NGXLogger;

  beforeEach(() => MockBuilder(EqualHeightService).mock(NGXLogger));

  beforeEach(() => {
    service = TestBed.inject(EqualHeightService);
    logger = TestBed.inject(NGXLogger);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should adjust parent element heights', () => {
    const parent = document.createElement('div') as HTMLElement;
    const child1 = document.createElement('div') as HTMLElement;
    const child2 = document.createElement('div') as HTMLElement;

    Object.defineProperty(child1, 'clientHeight', { value: 100 });
    Object.defineProperty(child2, 'clientHeight', { value: 200 });

    parent.appendChild(child1);
    parent.appendChild(child2);

    service.adjustElementParentHeights(parent.children);

    expect(parent.style.height).toBe('200px');
  });
});
