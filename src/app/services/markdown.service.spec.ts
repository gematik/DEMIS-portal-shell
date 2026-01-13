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

import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MockBuilder } from 'ng-mocks';
import { MarkdownService } from './markdown.service';

describe('MarkdownService', () => {
  beforeEach(() => MockBuilder(MarkdownService));

  let service: MarkdownService;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    service = TestBed.inject(MarkdownService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert markdown to sanitized HTML', () => {
    const markdown = '# Hello **World**';
    const html = service.convertToSanitizedHtml(markdown);
    expect(html).toContain('<h1');
    expect(html).toContain('Hello');
    expect(html).toContain('<strong>World</strong>');
  });

  it('should sanitize potentially dangerous HTML', () => {
    const markdown = 'Click <script>alert("xss")</script> here';
    const html = service.convertToSanitizedHtml(markdown);
    expect(html).not.toContain('<script>');
    expect(html).toContain('Click');
  });

  it('should return empty string for empty markdown', () => {
    const html = service.convertToSanitizedHtml('');
    expect(html).toBe('');
  });

  it('should use DomSanitizer.sanitize with SecurityContext.HTML', () => {
    spyOn(sanitizer, 'sanitize').and.callThrough();
    const markdown = '*test*';
    const convertedHtml = '<p><em>test</em></p>\n';
    service.convertToSanitizedHtml(markdown);
    expect(sanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, convertedHtml);
  });
});
