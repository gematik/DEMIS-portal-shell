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
import { Component } from '@angular/core';
import { AccessibleTextComponent } from './accessible-text.component';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'gem-demis-test-host',
  imports: [AccessibleTextComponent],
  template: `<gem-demis-accessible-text [visual]="visual" [screenReader]="screenReader" />`,
})
class TestHostComponent {
  visual = '';
  screenReader: string | undefined;
}

describe('AccessibleTextComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should render visual and screen-reader spans when screenReader is provided', () => {
    host.visual = '§';
    host.screenReader = 'Paragraph';
    fixture.detectChanges();

    const hiddenSpan = fixture.debugElement.query(By.css('[aria-hidden="true"]'));
    const srSpan = fixture.debugElement.query(By.css('.sr-only'));

    expect(hiddenSpan.nativeElement.textContent).toBe('§');
    expect(srSpan.nativeElement.textContent).toBe('Paragraph');
  });

  it('should render only the visual text when no screenReader is provided', () => {
    host.visual = 'Normal text';
    host.screenReader = undefined;
    fixture.detectChanges();

    const hiddenSpan = fixture.debugElement.query(By.css('[aria-hidden="true"]'));
    const srSpan = fixture.debugElement.query(By.css('.sr-only'));

    expect(hiddenSpan).toBeNull();
    expect(srSpan).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('Normal text');
  });
});
