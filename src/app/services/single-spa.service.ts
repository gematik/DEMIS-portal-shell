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

import { Injectable } from '@angular/core';
import { mountRootParcel, Parcel, ParcelConfig } from 'single-spa';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SingleSpaService {
  private loadedParcels: {
    [appName: string]: Parcel;
  } = {};

  mount(appName: string, domElement: HTMLElement): Observable<unknown> {
    return from(System.import<ParcelConfig>(appName)).pipe(
      tap((app: ParcelConfig) => {
        this.loadedParcels[appName] = mountRootParcel(app, {
          domElement,
        });
      })
    );
  }

  unmount(appName: string): Observable<unknown> {
    return from(this.loadedParcels[appName].unmount()).pipe(tap(() => delete this.loadedParcels[appName]));
  }
}
