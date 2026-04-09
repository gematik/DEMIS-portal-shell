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

import { TestBed } from '@angular/core/testing';

import { MockModule } from 'ng-mocks';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormlyFormDialogProps, FormlyFormDialogService, InputField } from './formly-form-dialog.service';
import { FormlyFormDialogComponent } from '../shared/components/formly-form-dialog/formly-form-dialog.component';

describe('FormlyFormDialogService', () => {
  let service: FormlyFormDialogService;
  let matDialog: MatDialog;

  const defaultFormDialogStyle = {
    height: 'auto',
    width: '610px',
    maxWidth: '610px',
    maxHeight: '80vh',
    disableClose: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MockModule(MatDialogModule)],
    });
    service = TestBed.inject(FormlyFormDialogService);
    matDialog = TestBed.inject(MatDialog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('FormDialogTests', () => {
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<FormlyFormDialogComponent>>;

    const formDialogData: FormlyFormDialogProps = {
      dialogId: 'test-form-dialog',
      title: 'Surveillance Zugang freischalten',
      preFormText:
        'Bitte geben Sie den für Ihre Einrichtung vergebenen <strong>Surveillance-User-Identifikator</strong> und die <strong>Postleitzahl</strong> ein. Dieser wurde Ihnen vom Robert-Koch-Institut bereitgestellt. Bei korrekter Eingabe wird Ihr Nutzerkonto nach dem nächsten Login für die verknüpften Berechtigungen freigeschaltet.',
      postFormText: 'Weitere Informationen finden Sie hier: <a href="https://wiki.gematik.de/x/bATWKw" target="_blank">zur RKI-Seite</a>',
      cancelButtonText: 'Abbrechen',
      acceptButtonText: 'Freischalten',
      formlyFieldConfig: [
        {
          id: 'suId',
          key: 'suId',
          type: 'input',
          props: {
            label: 'Surveillance-User-Identificator',
            required: true,
            placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            description: 'Ihre Surveillance-User-Identifikator ist im Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          },
          validationRegex: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
          errorMsg:
            'Der Surveillance-User-Identifikator muss im Format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx sein und darf nur aus Hexadezimalzeichen bestehen.',
        } as InputField,
        {
          id: 'postalCode',
          key: 'postalCode',
          type: 'input',
          props: {
            label: 'Postleitzahl der Einrichtung',
            required: true,
            placeholder: '12345',
          },
          validationRegex: '[0-9]{5}',
          errorMsg: 'Die Postleitzahl muss aus genau 5 Ziffern bestehen.',
        } as InputField,
      ],
    };

    beforeEach(() => {
      mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    });

    describe('showFormDialog', () => {
      it('should open the MatDialog with FormlyFormDialogComponent and default style', () => {
        const openSpy = spyOn(matDialog, 'open').and.returnValue(mockDialogRef);
        service.showFormlyFormDialog(formDialogData);
        expect(openSpy).toHaveBeenCalledWith(FormlyFormDialogComponent, {
          data: formDialogData,
          ...defaultFormDialogStyle,
        });
      });

      it('should open the MatDialog with FormlyFormDialogComponent and custom style properties', () => {
        const customFormDialogStyle = {
          height: '300px',
          width: '310px',
          maxWidth: '200px',
          maxHeight: '60vh',
          disableClose: true,
        };

        const openSpy = spyOn(matDialog, 'open').and.returnValue(mockDialogRef);
        service.showFormlyFormDialog(formDialogData, customFormDialogStyle);
        expect(openSpy).toHaveBeenCalledWith(FormlyFormDialogComponent, {
          data: formDialogData,
          ...customFormDialogStyle,
        });
      });
    });

    describe('closeDialog', () => {
      it('should close the dialog with result when dialog exists', () => {
        spyOn(matDialog, 'open').and.returnValue(mockDialogRef);

        const formDialogData: FormlyFormDialogProps = { dialogId: 'test_id', title: 'Test' };
        service.showFormlyFormDialog(formDialogData);

        service.closeDialog('success');

        expect(mockDialogRef.close).toHaveBeenCalledWith('success');
      });

      it('should close the dialog without result when no result provided', () => {
        spyOn(matDialog, 'open').and.returnValue(mockDialogRef);

        const formDialogData: FormlyFormDialogProps = { dialogId: 'test_id', title: 'Test' };
        service.showFormlyFormDialog(formDialogData);

        service.closeDialog();

        expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
      });

      it('should not error when closing a non-existent dialog', () => {
        expect(() => service.closeDialog()).not.toThrow();
      });

      it('should reset dialogRef to null after closing', () => {
        spyOn(matDialog, 'open').and.returnValue(mockDialogRef);

        const formDialogData: FormlyFormDialogProps = { dialogId: 'test_id', title: 'Test' };
        service.showFormlyFormDialog(formDialogData);
        service.closeDialog();

        // Versuche erneut zu schließen - sollte nicht close aufrufen
        service.closeDialog();

        expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
      });
    });
  });
});
