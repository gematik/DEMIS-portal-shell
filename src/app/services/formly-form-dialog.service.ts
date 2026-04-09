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

import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { FormlyFormDialogComponent } from '../shared/components/formly-form-dialog/formly-form-dialog.component';

export interface DialogStyle {
  height?: string;
  width?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export interface FormlyFormDialogProps {
  dialogId: string;
  title?: string;
  preFormText?: string;
  formlyFieldConfig?: FormlyFieldConfig[];
  postFormText?: string;
  cancelButtonText?: string;
  acceptButtonText?: string;
  showAcceptButton?: boolean;
  titleIcon?: string;
  titleIconColor?: string;
}

export interface InputField extends FormlyFieldConfig {
  validationRegex?: string;
  errorMsg?: string;
}

@Injectable({ providedIn: 'root' })
export class FormlyFormDialogService {
  private readonly matDialog = inject(MatDialog);
  private readonly maxModalHeight = '80vh';
  private dialogRef: MatDialogRef<FormlyFormDialogComponent> | null = null;

  showFormlyFormDialog(data: FormlyFormDialogProps, style?: DialogStyle): Observable<string | undefined> {
    if (this.dialogRef) {
      return this.dialogRef.afterClosed();
    }
    this.dialogRef = this.matDialog.open(FormlyFormDialogComponent, {
      data: data,
      height: style?.height ?? 'auto',
      maxHeight: style?.maxHeight ?? this.maxModalHeight,
      width: style?.width ?? '610px',
      maxWidth: this.calculateMax('610px', style?.width, style?.maxWidth),
      disableClose: true,
    });
    return this.dialogRef.afterClosed();
  }

  closeDialog(result?: any): void {
    if (this.dialogRef) {
      this.dialogRef.close(result);
      this.dialogRef = null;
    }
  }

  calculateMax(defaultMax: string, given?: string, givenMax?: string): string {
    if (givenMax) return givenMax;
    if (!given) return defaultMax;

    const unit = defaultMax.replaceAll(/\d/g, '');
    if (!given.endsWith(unit)) return given;

    const givenValue = Number.parseInt(given, 10);
    const defaultValue = Number.parseInt(defaultMax, 10);

    return givenValue > defaultValue ? given : defaultMax;
  }
}
