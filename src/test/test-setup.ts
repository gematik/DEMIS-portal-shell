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

import { AppConstants } from '../app/shared/app-constants';

export class TestSetup {
  static CONFIG = {
    featureFlags: {
      CONFIG_TOKEN_INJECTION_ENABLED: true,
      FEATURE_FLAG_NON_NOMINAL_NOTIFICATION: true,
      FEATURE_FLAG_PORTAL_INFOBANNER: true,
    },
  };

  static JWT_ROLES = [
    {
      roles: [AppConstants.Roles.BED_OCCUPANCY_SENDER],
      link: 'a-to-bed-occupancy',
      tile: 'welcome-tile-bed-occupancy',
      doNegativeTest: true,
    },
    {
      roles: [AppConstants.Roles.PATHOGEN_NOTIFICATION_SENDER],
      link: 'a-to-pathogen',
      tile: 'welcome-tile-pathogen',
      doNegativeTest: true,
    },
    {
      roles: [AppConstants.Roles.DISEASE_NOTIFICATION_SENDER],
      link: 'a-to-disease',
      tile: 'welcome-tile-disease',
      doNegativeTest: true,
    },
    {
      roles: [
        AppConstants.Roles.IGS_SEQUENCE_DATA_SENDER,
        AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER_FASTA_ONLY,
        AppConstants.Roles.IGS_NOTIFICATION_DATA_SENDER,
      ],
      link: 'a-to-sequence-notification',
      tile: 'welcome-tile-sequence-notification',
      doNegativeTest: true,
    },
  ];
}
