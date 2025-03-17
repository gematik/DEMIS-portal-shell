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

import { inject, Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root',
})
export class EqualHeightService {
  private logger = inject(NGXLogger);

  adjustElementParentHeights(elements: HTMLCollectionOf<Element>) {
    const contentContainerArray = Array.from(elements);
    const maxTileContentHeight = `${Math.max(...contentContainerArray.map(c => c.clientHeight))}px`;
    contentContainerArray.forEach(c => {
      const parentElement = c.parentElement as HTMLElement;
      if (parentElement.style.height !== maxTileContentHeight) {
        this.logger.debug(`Setting height of ${parentElement.id} to ${maxTileContentHeight}`);
        parentElement.style.height = maxTileContentHeight;
      }
    });
  }
}
