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

import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'gem-demis-formly-form-dialog-styles',
  template: `<!-- ONLY USED FOR GLOBAL STYLES! DO NOT EXPORT! -->`,
  styles: `
    .gem-demis-formly-form-dialog-content {
      formly-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .initial-notification-id-input-field-valid {
        --mat-form-field-outlined-outline-color: var(--color-success-dark);
        --mat-form-field-outlined-focus-outline-color: var(--color-success-dark);
        --mat-form-field-outlined-hover-outline-color: var(--color-success-dark);
        --mat-form-field-outlined-label-text-color: var(--color-success-dark);
        --mat-form-field-outlined-hover-label-text-color: var(--color-success-dark);
        --mat-form-field-outlined-focus-label-text-color: var(--color-success-dark);
      }

      .initial-notification-id-input-field-invalid,
      .initial-notification-id-input-field-notvalidated {
        --mat-form-field-outlined-error-outline-color: var(--color-error-dark);
        --mat-form-field-outlined-error-focus-outline-color: var(--color-error-dark);
        --mat-form-field-outlined-error-hover-outline-color: var(--color-error-dark);
        --mat-form-field-outlined-error-label-text-color: var(--color-error-dark);
        --mat-form-field-outlined-error-hover-label-text-color: var(--color-error-dark);
        --mat-form-field-outlined-error-focus-label-text-color: var(--color-error-dark);
      }
    }
  `,
  encapsulation: ViewEncapsulation.None, // <-- Applies styles globally!
})
export class FormlyFormDialogStylesComponent {}
