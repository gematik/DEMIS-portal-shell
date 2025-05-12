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

import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { MockBuilder } from 'ng-mocks';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => MockBuilder(LocalStorageService));

  beforeEach(() => {
    service = TestBed.inject(LocalStorageService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get an item', () => {
    const key = 'testKey';
    const value = 'testValue';
    service.setItem(key, value);
    expect(service.getItem<string>(key)).toEqual(value);
  });

  it('should get null, if an item is not found', () => {
    window.localStorage.clear();
    expect(service.getItem<string>('key')).toBeNull();
  });

  it("should get null, if window doesn't have a localStorage attribute", () => {
    const lsBck = window.localStorage;
    delete (window as any).localStorage;
    expect(service.getItem<string>('key')).toBeNull();
    (window as any).localStorage = lsBck;
  });

  it('should remove an item', () => {
    const key = 'testKey';
    const value = 'testValue';
    service.setItem(key, value);
    service.removeItem(key);
    expect(service.getItem<string>(key)).toBeNull();
  });

  it('should update an item', () => {
    const key = 'testKey';
    const value = 'testValue';
    const newValue = 'newValue';
    service.setItem(key, value);
    service.updateItem(key, newValue);
    expect(service.getItem<string>(key)).toEqual(newValue);
  });

  it('should add an item to a list', () => {
    const key = 'testList';
    const value1 = 'testValue1';
    const value2 = 'testValue2';
    service.addItemToList(key, value1);
    expect(service.getItem<string[]>(key)).toEqual([value1]);
    service.addItemToList(key, value2);
    expect(service.getItem<string[]>(key)).toEqual([value2, value1]);
  });

  it('should not add duplicate items to a list', () => {
    const key = 'testList';
    const value = 'testValue';
    service.addItemToList(key, value);
    service.addItemToList(key, value);
    expect(service.getItem<string[]>(key)?.length).toBe(1);
  });

  it('should remove an item from a list', () => {
    const key = 'testList';
    const value = 'testValue';
    service.addItemToList(key, value);
    service.removeItemFromList(key, value);
    expect(service.getItem<string[]>(key)).not.toContain(value);
  });

  it('should perform the remove from list, even when there was an empty list in local storage', () => {
    const key = 'testList';
    const value = 'testValue';
    service.removeItemFromList(key, value);
    expect(service.getItem<string[]>(key)).not.toContain(value);
  });
});
