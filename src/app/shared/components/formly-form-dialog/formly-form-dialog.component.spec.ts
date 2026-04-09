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

  it('should call closeDialog with model when closeDialog is called', async () => {
    component.model = { testField: 'testValue' };
    await component.closeDialog();
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

    it('should extract required fields from inputs', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [FormlyFormDialogComponent],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              formlyFieldConfig: [
                { key: 'field1', props: { required: true } },
                { key: 'field2', props: { required: false } },
                { key: 'field3', props: { required: true } },
              ],
            },
          },
          { provide: FormlyFormDialogService, useValue: formlyFormDialogServiceSpy },
          { provide: LiveAnnouncer, useValue: liveAnnouncerSpy },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(FormlyFormDialogComponent);
      const newComponent = newFixture.componentInstance;
      expect(newComponent.requiredFields).toEqual(['field1', 'field3']);
    });
  });
});
