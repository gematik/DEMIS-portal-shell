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
import { FooterComponent } from './footer.component';
import { AuthService } from '../services';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let logger: jasmine.SpyObj<NGXLogger>;
  let tokenChangedSubject: BehaviorSubject<void>;

  beforeEach(async () => {
    tokenChangedSubject = new BehaviorSubject<void>(undefined);

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsername', 'isAuthenticated', 'checkRole'], {
      $tokenChanged: tokenChangedSubject.asObservable(),
    });

    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug']);

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NGXLogger, useValue: loggerSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    logger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;

    // Set default return values
    authService.getUsername.and.returnValue('testuser');
    authService.isAuthenticated.and.returnValue(false);
    authService.checkRole.and.returnValue(false);

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
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      const usernameDiv = fixture.nativeElement.querySelector('#start-username');
      expect(usernameDiv).toBeFalsy();
    });

    it('should display username when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getUsername.and.returnValue('john.doe');
      fixture.detectChanges();
      const usernameDiv = fixture.nativeElement.querySelector('#start-username');
      expect(usernameDiv).toBeTruthy();
      expect(usernameDiv.textContent).toContain('john.doe');
    });

    it('should display unknown when username is not available', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getUsername.and.returnValue(null);
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
    it('should call refreshUserInfo on init', () => {
      spyOn<any>(component, 'refreshUserInfo');
      fixture.detectChanges();
      expect(component['refreshUserInfo']).toHaveBeenCalled();
    });

    it('should subscribe to token changes on init', () => {
      const refreshUserInfoSpy = spyOn<any>(component, 'refreshUserInfo').and.callThrough();
      fixture.detectChanges();
      const callCountAfterInit = refreshUserInfoSpy.calls.count();
      tokenChangedSubject.next();
      expect(refreshUserInfoSpy.calls.count()).toBeGreaterThan(callCountAfterInit);
    });

    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      spyOn<any>(component['unsubscriber'], 'next');
      spyOn<any>(component['unsubscriber'], 'complete');
      component.ngOnDestroy();
      expect(component['unsubscriber'].next).toHaveBeenCalled();
      expect(component['unsubscriber'].complete).toHaveBeenCalled();
    });
  });

  describe('user info update', () => {
    it('should update userInfo signal when refreshUserInfo is called', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getUsername.and.returnValue('jane.smith');
      fixture.detectChanges();

      expect(component.userInfo().isAuthenticated).toBe(true);
      expect(component.userInfo().username).toBe('jane.smith');
    });

    it('should set isAuthenticated computed signal correctly', () => {
      authService.isAuthenticated.and.returnValue(true);
      fixture.detectChanges();
      expect(component.isAuthenticated()).toBe(true);

      authService.isAuthenticated.and.returnValue(false);
      component['refreshUserInfo']();
      expect(component.isAuthenticated()).toBe(false);
    });
  });
});
