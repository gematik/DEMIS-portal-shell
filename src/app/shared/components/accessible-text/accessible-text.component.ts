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

import { Component, input } from '@angular/core';

/**
 * Renders visual text and an alternative screen-reader text using the
 * `aria-hidden` / visually-hidden pattern recommended by WCAG.
 *
 * Usage:
 * ```html
 * <gem-demis-accessible-text visual="§" screenReader="Paragraph" />
 * <gem-demis-accessible-text visual="IfSG" screenReader="Infektionsschutzgesetz" />
 * ```
 *
 * When only `visual` is provided (no `screenReader`), the text is rendered
 * as-is without any accessibility transformation.
 */
@Component({
  selector: 'gem-demis-accessible-text',
  template: `
    @if (screenReader()) {
      <span aria-hidden="true">{{ visual() }}</span
      ><span class="sr-only">{{ screenReader() }}</span>
    } @else {
      {{ visual() }}
    }
  `,
  styles: `
    :host {
      display: inline;
    }
    .sr-only {
      border: 0;
      clip: rect(0, 0, 0, 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
      white-space: nowrap;
    }
  `,
})
export class AccessibleTextComponent {
  /** Text displayed visually on screen. */
  visual = input.required<string>();

  /** Text announced by screen readers. If omitted, `visual` is used as-is. */
  screenReader = input<string>();
}
