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

import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
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
  requiredFields: string[] = [];
  icon?: string;
  iconColor?: string;

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
    this.formlyFieldConfig = this.data.formlyFieldConfig ?? [];
    this.requiredFields = this.formlyFieldConfig.filter(field => field.props?.required).map(field => field.key as string);
  }

  abort(): void {
    this.liveAnnouncer.announce('Dialog geschlossen.', 'assertive').then(() => this.formlyFormDialogService.closeDialog());
  }

  closeDialog(): void {
    this.liveAnnouncer.announce('Dialog geschlossen.', 'assertive').then(() => this.formlyFormDialogService.closeDialog(this.model));
  }

  nextButtonDisabled = (): boolean => {
    return !this.form.valid;
  };

  proceed(): void {
    if (this.form.valid) {
      this.closeDialog();
    }
  }
}
