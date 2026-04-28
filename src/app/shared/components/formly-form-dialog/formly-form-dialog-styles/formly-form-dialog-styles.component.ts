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
      line-height: 1.3 !important;

      formly-group {
        .mat-mdc-form-field {
          margin-bottom: 6px;
        }
      }

      .mat-mdc-form-field-subscript-wrapper,
      .mat-mdc-form-field-hint-wrapper,
      .mat-mdc-form-field-error-wrapper,
      .mat-mdc-form-field-error {
        height: 0;
        padding: 0px;
        line-height: 1.3 !important;

        &:has(*:not(:empty)) {
          height: fit-content;
        }
      }

      .mdc-text-field--invalid {
        position: relative;
        &::after {
          content: 'warning_amber';
          font-family: 'Material Icons';
          color: var(--color-error-dark);
          font-size: 24px;
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      .mat-mdc-form-field-subscript-wrapper {
        padding-bottom: 6px;
        overflow: hidden;
      }

      --mat-form-field-outlined-error-outline-color: var(--color-error-dark);
      --mat-form-field-outlined-error-focus-outline-color: var(--color-error-dark);
      --mat-form-field-outlined-error-hover-outline-color: var(--color-error-dark);
      --mat-form-field-outlined-error-label-text-color: var(--color-error-dark);
      --mat-form-field-outlined-error-hover-label-text-color: var(--color-error-dark);
      --mat-form-field-outlined-error-focus-label-text-color: var(--color-error-dark);
      --mat-form-field-error-text-color: var(--color-error-dark);
    }
  `,
  encapsulation: ViewEncapsulation.None, // <-- Applies styles globally!
})
export class FormlyFormDialogStylesComponent {}
