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

import { beforeEach, describe, expect, it, type MockedObject, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { AuthService } from '../services';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let authService: MockedObject<AuthService>;
  let tokenChangedSubject: BehaviorSubject<void>;

  beforeEach(async () => {
    tokenChangedSubject = new BehaviorSubject<void>(undefined);

    const authServiceSpy = {
      getUsername: vi.fn().mockName('AuthService.getUsername'),
      isAuthenticated: vi.fn().mockName('AuthService.isAuthenticated'),
      checkRole: vi.fn().mockName('AuthService.checkRole'),
      $tokenChanged: tokenChangedSubject.asObservable(),
    };

    const loggerSpy = {
      debug: vi.fn().mockName('NGXLogger.debug'),
    };

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NGXLogger, useValue: loggerSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as MockedObject<AuthService>;

    // Set default return values
    authService.getUsername.mockReturnValue('testuser');
    authService.isAuthenticated.mockReturnValue(false);
    authService.checkRole.mockReturnValue(false);

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
  });

  describe('rendering', () => {
    it('should render the footer', () => {
      fixture.detectChanges();
      const footer = fixture.nativeElement.querySelector('footer');
      expect(footer).toBeTruthy();
      expect(footer.getAttribute('role')).toBe('contentinfo');
    });

    it('should display RKI logo', () => {
      fixture.detectChanges();
      const rikiLogoImg = fixture.nativeElement.querySelector('.RKI-logo img');
      expect(rikiLogoImg).toBeTruthy();
      expect(rikiLogoImg.getAttribute('alt')).toBe('Robert Koch Institut');
    });

    it('should display EU logo', () => {
      fixture.detectChanges();
      const euLogoImg = fixture.nativeElement.querySelector('.EU-logo img');
      expect(euLogoImg).toBeTruthy();
      expect(euLogoImg.getAttribute('alt')).toContain('Europäischen Union');
    });
  });

  describe('authentication status', () => {
    it('should not display username when not authenticated', () => {
      authService.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();
      const usernameDiv = fixture.nativeElement.querySelector('#start-username');
      expect(usernameDiv).toBeFalsy();
    });

    it('should display username when authenticated', () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getUsername.mockReturnValue('john.doe');
      fixture.detectChanges();
      const usernameDiv = fixture.nativeElement.querySelector('#start-username');
      expect(usernameDiv).toBeTruthy();
      expect(usernameDiv.textContent).toContain('john.doe');
    });

    it('should display unknown when username is not available', () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getUsername.mockReturnValue(null);
      fixture.detectChanges();
      const usernameDiv = fixture.nativeElement.querySelector('#start-username');
      expect(usernameDiv.textContent).toContain('unknown');
    });
  });

  describe('footer links', () => {
    it('should render footer navigation with correct aria-label', () => {
      fixture.detectChanges();
      const nav = fixture.nativeElement.querySelector('nav.footer-right-bottom');
      expect(nav).toBeTruthy();
      expect(nav.getAttribute('aria-label')).toBe('Footer Navigation');
    });

    it('should contain links to imprint and privacy policy', () => {
      fixture.detectChanges();
      const links = fixture.nativeElement.querySelectorAll('nav.footer-right-bottom a');
      expect(links.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('lifecycle', () => {
    it('should populate userInfo on init', () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getUsername.mockReturnValue('init.user');
      fixture.detectChanges();

      expect(component.userInfo().isAuthenticated).toBe(true);
      expect(component.userInfo().username).toBe('init.user');
    });

    it('should update userInfo when token changes', () => {
      authService.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();
      expect(component.isAuthenticated()).toBe(false);

      authService.isAuthenticated.mockReturnValue(true);
      authService.getUsername.mockReturnValue('new.user');
      tokenChangedSubject.next();

      expect(component.isAuthenticated()).toBe(true);
      expect(component.userInfo().username).toBe('new.user');
    });

    it('should stop updating userInfo after destroy', () => {
      authService.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();

      component.ngOnDestroy();

      authService.isAuthenticated.mockReturnValue(true);
      authService.getUsername.mockReturnValue('after.destroy');
      tokenChangedSubject.next();

      expect(component.isAuthenticated()).toBe(false);
    });
  });

  describe('user info update', () => {
    it('should set isAuthenticated computed signal correctly', () => {
      authService.isAuthenticated.mockReturnValue(true);
      fixture.detectChanges();
      expect(component.isAuthenticated()).toBe(true);

      authService.isAuthenticated.mockReturnValue(false);
      tokenChangedSubject.next();
      expect(component.isAuthenticated()).toBe(false);
    });

    it('should fallback to unknown when username is null', () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getUsername.mockReturnValue(null);
      fixture.detectChanges();

      expect(component.userInfo().username).toBe('unknown');
    });
  });
});
