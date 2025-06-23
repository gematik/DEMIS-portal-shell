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

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MockBuilder, MockedComponentFixture, MockProvider, MockRender } from 'ng-mocks';
import { InfoBannerStorageService } from 'src/app/services/info-banner-storage.service';
import { MarkdownService } from 'src/app/services/markdown.service';
import { InfoBannerConfig } from 'src/environments/dynamic-environment';
import { InfoBannerContentComponent } from './info-banner-content.component';

describe('InfoBannerContentComponent', () => {
  let fixture: MockedComponentFixture<InfoBannerContentComponent, any>;
  let component: InfoBannerContentComponent;
  let loader: HarnessLoader;

  const config: InfoBannerConfig = {
    id: '293d6b0d-19c7-4819-aead-6313e61b4a6b',
    type: 'info',
    shownIn: 'all',
    content: 'Some **markdown** content',
    closable: true,
    moreInfo: 'https://example.com',
  };

  beforeEach(() => MockBuilder(InfoBannerContentComponent).provide(MarkdownService).provide(MockProvider(InfoBannerStorageService)));

  beforeEach(() => {
    fixture = MockRender(InfoBannerContentComponent, { config });
    component = fixture.point.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct bannerId', () => {
    expect(component.bannerId).toBe(config.id);
  });

  it('should return correct bannerType', () => {
    expect(component.bannerType).toBe(config.type);
  });

  it('should return correct bannerIcon for info', () => {
    expect(component.bannerIcon).toBe(config.type);
  });

  it('should return correct bannerIcon for warning', () => {
    fixture.componentInstance.config = { ...config, type: 'warning' };
    fixture.detectChanges();
    expect(component.bannerIcon).toBe('error');
  });

  it('should convert markdown content to sanitized HTML', () => {
    const convertToSanitizedHtmlSpy = spyOn(TestBed.inject(MarkdownService), 'convertToSanitizedHtml');
    fixture.detectChanges();
    expect(convertToSanitizedHtmlSpy).toHaveBeenCalledWith(config.content);
  });

  it('should return true for isClosable if closable is true', () => {
    expect(component.isClosable).toBeTrue();
  });

  it('should return moreInfoUrl', () => {
    expect(component.moreInfoUrl).toBe('https://example.com');
  });

  it('should return undefined for moreInfoUrl if not set', () => {
    fixture.componentInstance.config = { ...config, moreInfo: undefined };
    fixture.detectChanges();
    expect(component.moreInfoUrl).toBeUndefined();
  });

  it('should return true for hasActions if closable or moreInfoUrl is present', () => {
    expect(component.hasActions).toBeTrue();
    fixture.componentInstance.config = { ...config, closable: false, moreInfo: undefined };
    fixture.detectChanges();
    expect(component.hasActions).toBeFalse();
  });

  it('should call closeBanner on onCloseBanner', async () => {
    const onCloseBannerSpy = spyOn(component, 'onCloseBanner').and.callThrough();
    const closeBannerSpy = spyOn(TestBed.inject(InfoBannerStorageService), 'closeBanner');
    const closeBtn = await loader.getHarness(MatButtonHarness.with({ selector: `#demis-portal-banner-close-btn-${config.id}` }));

    await closeBtn.click();

    expect(onCloseBannerSpy).toHaveBeenCalled();
    expect(closeBannerSpy).toHaveBeenCalledWith(config.id);
  });
});
