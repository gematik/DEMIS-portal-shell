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

import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { SingleSpaService } from '../services/single-spa.service';

@Component({
  selector: 'app-spa-host',
  template: '<div #appContainer></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SpaHostComponent implements OnInit {
  private readonly singleSpaService = inject(SingleSpaService);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('appContainer', { static: true })
  appContainerRef: ElementRef | undefined;

  appName: string = '';

  ngOnInit() {
    this.appName = this.route.snapshot.data['app'];
    this.mount().subscribe();
  }

  mount(): Observable<unknown> {
    return this.singleSpaService.mount(this.appName, this.appContainerRef?.nativeElement);
  }

  unmount(): Observable<unknown> {
    return this.singleSpaService.unmount(this.appName);
  }
}
