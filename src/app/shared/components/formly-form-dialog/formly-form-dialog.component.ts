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

import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { FormlyFormDialogStylesComponent } from './formly-form-dialog-styles/formly-form-dialog-styles.component';
import { NgTemplateOutlet } from '@angular/common';
import { FormlyFormDialogProps, FormlyFormDialogService, InputField } from '../../../services/formly-form-dialog.service';
import { MarkdownService } from '@gematik/demis-portal-core-library';

@Component({
  selector: 'gem-demis-formly-form-dialog',
  imports: [
    NgTemplateOutlet,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatDialogActions,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
    MatIconModule,
    MatButtonModule,
    FormlyFormDialogStylesComponent,
  ],
  templateUrl: './formly-form-dialog.component.html',
  styleUrls: ['./formly-form-dialog.component.scss'],
})
export class FormlyFormDialogComponent {
  private readonly data = inject<FormlyFormDialogProps>(MAT_DIALOG_DATA);
  private readonly formlyFormDialogService = inject(FormlyFormDialogService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly markdownService = inject(MarkdownService);
  private readonly destroyRef = inject(DestroyRef);

  dialogId: string;
  title?: string;
  preFormText?: string;
  postFormText?: string;
  cancelButtonText?: string;
  acceptButtonText?: string;
  formlyFieldConfig: InputField[] = [];
  form = new FormGroup({});
  model: Record<string, unknown> = {};
  options: FormlyFormOptions = {};
  showAcceptButton: boolean;
  icon?: string;
  iconColor?: string;
  submitValidation?: (model: Record<string, unknown>, form: FormGroup) => Promise<boolean>;
  errorNamesToCleanOnChange?: string[];

  constructor() {
    this.dialogId = this.data.dialogId;
    this.title = this.data.title;
    this.preFormText = this.data.preFormText ? this.markdownService.convertToSanitizedHtml(this.data.preFormText) : undefined;
    this.postFormText = this.data.postFormText ? this.markdownService.convertToSanitizedHtml(this.data.postFormText) : undefined;
    this.icon = this.data.titleIcon;
    this.iconColor = this.data.titleIconColor;
    this.cancelButtonText = this.data.cancelButtonText;
    this.acceptButtonText = this.data.acceptButtonText;
    this.showAcceptButton = this.data.showAcceptButton ?? true;
    this.formlyFieldConfig = this.addDefaultPropsToFields(this.data.formlyFieldConfig);
    this.submitValidation = this.data.submitValidation ?? undefined;
    this.errorNamesToCleanOnChange = this.data.errorNamesToCleanOnChange;

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.clearAllErrors());
  }

  addDefaultPropsToFields(fields?: InputField[]): InputField[] {
    if (!fields) {
      return [];
    }
    return fields.map((field, index) => {
      field.props = field.props ?? {};
      return {
        ...field,
        props: {
          ...field.props,
          subscriptSizing: 'dynamic',
          floatLabel: 'always',
        },
        validation: {
          ...field.validation,
          messages: {
            ...field.validation?.messages,
            externalValidation: (err: any) => err,
          },
        },
      };
    });
  }

  abort(): void {
    this.liveAnnouncer.announce('Dialog geschlossen.', 'assertive').then(() => this.formlyFormDialogService.closeDialog());
  }

  async proceed(): Promise<void> {
    if (!this.submitValidation) {
      this.liveAnnouncer.announce('Dialog geschlossen.', 'assertive').then(() => this.formlyFormDialogService.closeDialog(this.model));
      return;
    }
    if (await this.submitValidation(this.model, this.form)) {
      this.liveAnnouncer.announce('Dialog geschlossen.', 'assertive').then(() => this.formlyFormDialogService.closeDialog(this.model));
      return;
    }
    this.liveAnnouncer.announce('Eingaben sind ungültig. Bitte überprüfen!', 'assertive');
  }

  private clearAllErrors(): void {
    this.form.setErrors(null);
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      this.errorNamesToCleanOnChange?.forEach(errorName => {
        const { [errorName]: removedError, ...remainingErrors } = control?.errors || {};
        control?.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
      });
    });
  }

  nextButtonDisabled = (): boolean => {
    return !this.form.valid;
  };
}
