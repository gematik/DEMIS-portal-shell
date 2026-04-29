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

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from 'src/app/about/about.component';
import { ContactComponent } from 'src/app/contact/contact.component';
import { PrivacyPolicyComponent } from 'src/app/privacy-policy/privacy-policy.component';
import { kcAuthGuard } from 'src/app/services/auth.guard';
import { roleGuard } from 'src/app/services/role.guard';
import { AppConstants } from 'src/app/shared/app-constants';
import { ImprintComponent } from './imprint/imprint.component';
import { WelcomeComponent } from 'src/app/welcome/welcome.component';
import { AccessibilityStatementComponent } from './accessibiliy-statement/accessibility-statement.component';

export const unprotectedRoutes: Routes = [
  {
    path: AppConstants.PathSegments.ABOUT,
    component: AboutComponent,
  },
  {
    path: AppConstants.PathSegments.PRIVACY_POLICY,
    component: PrivacyPolicyComponent,
  },
  {
    path: AppConstants.PathSegments.SITE_NOTICE, // can be removed when FeatureFlag FOOTER_LINKS_CORRECTION is removed
    component: ImprintComponent,
  },
  {
    path: AppConstants.PathSegments.IMPRINT,
    component: ImprintComponent,
  },

  {
    path: AppConstants.PathSegments.ACCESSIBILITY_STATEMENT,
    component: AccessibilityStatementComponent,
  },
  {
    path: AppConstants.PathSegments.WELCOME,
    component: WelcomeComponent,
  },
  {
    path: AppConstants.PathSegments.CONTACT,
    component: ContactComponent,
  },
];

const protectedRoutes: Routes = [
  {
    path: AppConstants.PathSegments.BED_OCCUPANCY,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.BED_OCCUPANCY_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-bed-occupancy' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.PATHOGEN_NOTIFICATION,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-pathogen' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.PATHOGEN_NOTIFICATION_FOLLOW_UP,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-pathogen' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.PATHOGEN_NOTIFICATION_NON_NOMINAL,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-pathogen' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.PATHOGEN_NOTIFICATION_ANONYMOUS,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.PATHOGEN_NOTIFICATION_ANONYMOUS_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-pathogen' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.DISEASE_NOTIFICATION,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.DISEASE_NOTIFICATION_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-disease' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.DISEASE_NOTIFICATION_FOLLOW_UP,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.DISEASE_NOTIFICATION_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-disease' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.DISEASE_NOTIFICATION_NON_NOMINAL,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.DISEASE_NOTIFICATION_NON_NOMINAL_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-disease' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.SEQUENCE_NOTIFICATION,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-igs' },
      },
    ],
  },
  {
    path: AppConstants.PathSegments.ARE_NOTIFICATION,
    canActivate: [kcAuthGuard, roleGuard],
    data: { role: AppConstants.Roles.ARE_NOTIFICATION_SENDER },
    children: [
      {
        path: '**',
        loadChildren: () => import('src/app/spa-host/spa-host.module').then(m => m.SpaHostModule),
        data: { app: 'notification-portal-mf-are' },
      },
    ],
  },
];

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: `/${AppConstants.PathSegments.WELCOME}`,
  },
  ...unprotectedRoutes,
  ...protectedRoutes,
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    Location,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
})
export class AppRoutingModule {}
