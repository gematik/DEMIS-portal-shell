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

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpaHostComponent } from './spa-host.component';

@Injectable({ providedIn: 'root' })
export class SpaUnmountGuard implements CanDeactivate<SpaHostComponent> {
  canDeactivate(
    component: SpaHostComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    const currentApp = component.appName;
    const nextApp = this.extractAppDataFromRouteTree(nextState.root);

    if (currentApp === nextApp) {
      return true;
    }

    return component.unmount().pipe(map(_ => true));
  }

  private extractAppDataFromRouteTree(routeFragment: ActivatedRouteSnapshot): string | undefined {
    if (routeFragment.data && routeFragment.data['app']) {
      return routeFragment.data['app'];
    }

    if (!routeFragment.children.length) {
      return undefined;
    }

    return routeFragment.children.map(r => this.extractAppDataFromRouteTree(r)).find(r => r !== null);
  }
}
