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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FormControl } from '@angular/forms';
import { FormlyFormDialogComponent } from './formly-form-dialog.component';
import { FormlyFormDialogProps, FormlyFormDialogService } from '../../../services/formly-form-dialog.service';

describe('FormlyFormDialogComponent', () => {
  let component: FormlyFormDialogComponent;
  let fixture: ComponentFixture<FormlyFormDialogComponent>;
  let formlyFormDialogServiceSpy: jasmine.SpyObj<FormlyFormDialogService>;
  let liveAnnouncerSpy: jasmine.SpyObj<LiveAnnouncer>;

  const mockDialogData: FormlyFormDialogProps = {
    dialogId: 'test-dialog',
    title: 'Test Title',
    preFormText: 'Test Text',
    postFormText: 'Lower Text',
    cancelButtonText: 'Cancel',
    acceptButtonText: 'Accept',
    showAcceptButton: true,
    formlyFieldConfig: [],
  };

  beforeEach(async () => {
    formlyFormDialogServiceSpy = jasmine.createSpyObj('FormlyFormDialogService', ['closeDialog']);
    liveAnnouncerSpy = jasmine.createSpyObj('LiveAnnouncer', ['announce']);
    liveAnnouncerSpy.announce.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [FormlyFormDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: FormlyFormDialogService, useValue: formlyFormDialogServiceSpy },
        { provide: LiveAnnouncer, useValue: liveAnnouncerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyFormDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dialog data', () => {
    expect(component.title).toBe(mockDialogData.title);
    expect(component.preFormText).toContain(mockDialogData.preFormText);
    expect(component.postFormText).toContain(mockDialogData.postFormText);
    expect(component.cancelButtonText).toBe(mockDialogData.cancelButtonText);
    expect(component.acceptButtonText).toBe(mockDialogData.acceptButtonText);
    expect(component.showAcceptButton).toBeTrue();
  });

  it('should call closeDialog with undefined when abort is called', async () => {
    await component.abort();
    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Dialog geschlossen.', 'assertive');
    expect(formlyFormDialogServiceSpy.closeDialog).toHaveBeenCalledWith();
  });

  it('should call closeDialog with model when proceed is called', async () => {
    component.model = { testField: 'testValue' };
    await component.proceed();
    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Dialog geschlossen.', 'assertive');
    expect(formlyFormDialogServiceSpy.closeDialog).toHaveBeenCalledWith({ testField: 'testValue' });
  });

  describe('nextButtonDisabled', () => {
    it('should return true when form is invalid', () => {
      component.form.setErrors({ invalid: true });
      expect(component.nextButtonDisabled()).toBeTrue();
    });

    it('should return false when form is valid', () => {
      component.form.setErrors(null);
      expect(component.nextButtonDisabled()).toBeFalse();
    });
  });

  describe('proceed', () => {
    it('should close dialog when form is valid', async () => {
      component.form.setErrors(null);
      await component.proceed();
      expect(formlyFormDialogServiceSpy.closeDialog).toHaveBeenCalled();
    });

    it('should not close dialog when form is invalid', () => {
      component.form.setErrors({ invalid: true });
      component.proceed();
      expect(formlyFormDialogServiceSpy.closeDialog).not.toHaveBeenCalled();
    });
  });

  describe('constructor with different data', () => {
    it('should default showAcceptButton to true when not provided', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [FormlyFormDialogComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: FormlyFormDialogService, useValue: formlyFormDialogServiceSpy },
          { provide: LiveAnnouncer, useValue: liveAnnouncerSpy },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(FormlyFormDialogComponent);
      const newComponent = newFixture.componentInstance;
      expect(newComponent.showAcceptButton).toBeTrue();
    });
  });

  describe('externalValidation', () => {
    it('should close dialog when externalValidation returns isValid: true', async () => {
      component.form.setErrors(null);
      component.model = { testField: 'testValue' };
      component.submitValidation = jasmine.createSpy('externalValidation').and.resolveTo({ isValid: true });

      await component.proceed();

      expect(component.submitValidation).toHaveBeenCalledWith(component.model, component.form);
      expect(formlyFormDialogServiceSpy.closeDialog).toHaveBeenCalledWith({ testField: 'testValue' });
    });

    it('should set form errors when externalValidation returns isValid: false with errors', async () => {
      component.form.setErrors(null);
      component.model = { field1: 'value1', field2: 'value2' };
      component.form.addControl('field1', new FormControl('value1'));
      component.form.addControl('field2', new FormControl('value2'));

      component.submitValidation = jasmine.createSpy('externalValidation').and.resolveTo(false);

      await component.proceed();

      expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Eingaben sind ungültig. Bitte überprüfen!', 'assertive');
      expect(formlyFormDialogServiceSpy.closeDialog).not.toHaveBeenCalled();
    });

    it('should mark controls as touched when error hint is provided', async () => {
      component.form.setErrors(null);
      component.model = { field1: 'value1' };
      component.form.addControl('field1', new FormControl('value1'));

      component.submitValidation = jasmine.createSpy('externalValidation').and.resolveTo(false);

      await component.proceed();

      expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Eingaben sind ungültig. Bitte überprüfen!', 'assertive');
      expect(formlyFormDialogServiceSpy.closeDialog).not.toHaveBeenCalled();
    });

    it('should announce invalid inputs message on validation failure', async () => {
      component.form.setErrors(null);
      component.model = { field1: 'value1' };
      component.submitValidation = jasmine.createSpy('externalValidation').and.resolveTo(false);

      await component.proceed();

      expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Eingaben sind ungültig. Bitte überprüfen!', 'assertive');
    });
  });

  describe('clearAllErrors react as expected when form got changed', () => {
    // Helper to call private clearAllErrors method
    const callClearAllErrors = () => (component as any).clearAllErrors();

    beforeEach(() => {
      component.errorNamesToCleanOnChange = ['externalValidation'];
    });

    it('should clear form-level errors when form value changes', () => {
      const control = new FormControl<string>('initial');
      component.form.addControl('field1', control);
      component.form.setErrors({ externalValidation: true });

      callClearAllErrors();

      expect(component.form.errors).toBeNull();
    });

    it('should remove only externalValidation error from controls and keep other errors', () => {
      const control = new FormControl<string>('value');
      component.form.addControl('field1', control);
      control.setErrors({ externalValidation: 'External error', required: true });

      callClearAllErrors();

      expect(control.errors).toEqual({ required: true });
    });

    it('should set control errors to null when only externalValidation error exists', () => {
      const control = new FormControl<string>('value');
      component.form.addControl('field1', control);
      control.setErrors({ externalValidation: 'External error' });

      callClearAllErrors();

      expect(control.errors).toBeNull();
    });

    it('should not affect controls without externalValidation error', () => {
      const control = new FormControl<string>('value');
      component.form.addControl('field1', control);
      control.setErrors({ required: true, minlength: true });

      callClearAllErrors();

      expect(control.errors).toEqual({ required: true, minlength: true });
    });

    it('should handle multiple controls with mixed errors', () => {
      const control1 = new FormControl<string>('value1');
      const control2 = new FormControl<string>('value2');
      const control3 = new FormControl<string>('value3');

      component.form.addControl('field1', control1);
      component.form.addControl('field2', control2);
      component.form.addControl('field3', control3);

      control1.setErrors({ externalValidation: 'Error 1' });
      control2.setErrors({ externalValidation: 'Error 2', required: true });
      control3.setErrors({ required: true });

      callClearAllErrors();

      expect(control1.errors).toBeNull();
      expect(control2.errors).toEqual({ required: true });
      expect(control3.errors).toEqual({ required: true });
    });
  });
});
