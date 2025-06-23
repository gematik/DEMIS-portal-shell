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

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EventType, NavigationEnd } from '@angular/router';
import { MockBuilder, MockProvider, MockRender, ngMocks } from 'ng-mocks';
import { InfoBannerStorageService } from 'src/app/services/info-banner-storage.service';
import { NavigationStateStore } from 'src/app/services/navigation-state.service';
import { environment } from 'src/environments/environment';
import { MarkdownService } from '../services/markdown.service';
import { TypeGuardsService } from '../services/type-guards.service';
import { AppConstants } from '../shared/app-constants';
import { InfoBannerContentComponent } from './info-banner-content/info-banner-content.component';
import { InfoBannerSectionComponent } from './info-banner-section.component';

function generateNavigationEnd(url: string): NavigationEnd {
  return { type: EventType.NavigationEnd, id: 1, url, urlAfterRedirects: url };
}

const bannersClosedInitial: Set<string> = new Set<string>([]);
const bannersClosedSignal = signal<Set<string>>(bannersClosedInitial);

describe('InfoBannerSectionComponent', () => {
  beforeEach(() =>
    MockBuilder(InfoBannerSectionComponent)
      .keep(TypeGuardsService)
      .mock(InfoBannerContentComponent)
      .provide(MockProvider(InfoBannerStorageService, { bannersAlreadyClosed: bannersClosedSignal.asReadonly() }))
      .provide(MockProvider(MarkdownService))
      .provide(MockProvider(NavigationStateStore, { lastNavigationEnd: signal(generateNavigationEnd('/welcome')).asReadonly() }))
  );

  beforeEach(() => {
    bannersClosedSignal.set(bannersClosedInitial);
    spyOn(TestBed.inject(MarkdownService), 'convertToSanitizedHtml').and.callFake((c: string) => `${c}`);
  });

  it('should render banners with default closable and shownIn', () => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([
      { id: '1', content: 'Banner 1', type: 'info', closable: true, shownIn: 'all' },
      { id: '2', content: 'Banner 2', type: 'warning', closable: false, shownIn: 'all' },
    ]);

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    const configs = component.infoBannerConfigs;
    expect(configs.length).toBe(2);
    expect(configs[0].closable).toBeTrue();
    expect(configs[0].shownIn).toBe('all');
    expect(configs[0].content).toContain('Banner 1');
    expect(configs[1].closable).toBeFalse();
    expect(configs[1].shownIn).toBe('all');
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).toBeTruthy();
  });

  it('should filter out closed banners if closable', () => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([{ id: '1', content: 'Banner 1', type: 'info', closable: true, shownIn: 'all' }]);
    bannersClosedSignal.set(new Set(['1']));

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    expect(component.infoBannerConfigs.length).toBe(0);
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).not.toBeTruthy();
  });

  it('should always show non-closable banners even if closed', () => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([{ id: '1', content: 'Banner 1', type: 'info', closable: false, shownIn: 'all' }]);
    bannersClosedSignal.set(new Set(['1']));

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    expect(component.infoBannerConfigs.length).toBe(1);
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).toBeTruthy();
  });

  it('should filter banners by time', () => {
    const now = new Date();
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([
      {
        id: '1',
        content: 'Banner 1',
        type: 'info',
        closable: true,
        shownIn: 'all',
        startsAt: new Date(now.getTime() - 1000).toISOString(),
        endsAt: new Date(now.getTime() + 1000).toISOString(),
      },
      {
        id: '2',
        content: 'Banner 2',
        type: 'info',
        closable: true,
        shownIn: 'all',
        startsAt: new Date(now.getTime() + 10000).toISOString(),
        endsAt: new Date(now.getTime() + 20000).toISOString(),
      },
    ]);

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    expect(component.infoBannerConfigs.length).toBe(1);
    expect(component.infoBannerConfigs[0].id).toBe('1');
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).toBeTruthy();
  });

  it('should filter banners by shownIn = shell', () => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([{ id: '1', content: 'Banner 1', type: 'info', closable: true, shownIn: 'shell' }]);
    spyOn(TestBed.inject(NavigationStateStore), 'lastNavigationEnd').and.returnValue(generateNavigationEnd('/welcome'));

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    expect(component.infoBannerConfigs.length).toBe(1);
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).toBeTruthy();
  });

  it('should filter banners by shownIn as string array', () => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([
      { id: '1', content: 'Banner 1', type: 'info', closable: true, shownIn: [AppConstants.PathSegments.WELCOME] },
    ]);
    spyOn(TestBed.inject(NavigationStateStore), 'lastNavigationEnd').and.returnValue(generateNavigationEnd('/welcome'));

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    expect(component.infoBannerConfigs.length).toBe(1);
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).toBeTruthy();
  });

  it("should not show banners if shownIn doesn't match the required types", () => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([{ id: '1', content: 'Banner 1', type: 'info', closable: true, shownIn: 'never' as any }]);

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    expect(component.infoBannerConfigs.length).toBe(0);
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).not.toBeTruthy();
  });

  it('should return compoundType as warning if any banner is warning', () => {
    spyOnProperty(environment, 'infoBanners', 'get').and.returnValue([
      { id: '1', content: 'Banner 1', type: 'info', closable: true, shownIn: 'all' },
      { id: '2', content: 'Banner 2', type: 'warning', closable: true, shownIn: 'all' },
    ]);

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    expect(component.compoundType).toBe('warning');
  });

  it('should render stage indicator', () => {
    spyOnProperty(environment, 'stageIndicator', 'get').and.returnValue({
      content: 'TEST_STAGE_INDICATOR_CONTENT',
      moreInfo: 'TEST_MORE_INFO',
      demisHomeLogoFile: 'TEST_DEMIS_HOME_LOGO_FILE',
    });

    ngMocks.flushTestBed();
    const fixture = MockRender(InfoBannerSectionComponent);
    const component = fixture.point.componentInstance;

    const stageIndicatorConfig = component.stageIndicatorBannerConfig;
    expect(stageIndicatorConfig).toBeDefined();
    expect(stageIndicatorConfig?.id).toBe('demis-portal-stage-indicator');
    expect(stageIndicatorConfig?.type).toBe('stage-indicator');
    expect(stageIndicatorConfig?.content).toBe('TEST_STAGE_INDICATOR_CONTENT');
    expect(stageIndicatorConfig?.shownIn).toBe('all');
    expect(stageIndicatorConfig?.closable).toBeFalse();
    expect(stageIndicatorConfig?.moreInfo).toBe('TEST_MORE_INFO');
    expect(ngMocks.findInstance(fixture, InfoBannerContentComponent, undefined)).toBeTruthy();
  });
});
