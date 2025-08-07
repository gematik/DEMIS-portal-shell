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

import { environment } from '../../environments/environment';

export function isNonNominalNotificationActivated(): boolean {
  return environment.featureFlags?.FEATURE_FLAG_NON_NOMINAL_NOTIFICATION ?? false;
}

export function isFollowUpNotificationActivated(): boolean {
  return environment.featureFlags?.FEATURE_FLAG_FOLLOW_UP_NOTIFICATION ?? false;
}

export namespace AppConstants {
  export enum ShellPathSegments {
    ABOUT = 'about',
    SITE_NOTICE = 'impressum',
    PRIVACY_POLICY = 'privacy-policy',
    WELCOME = 'welcome',
  }

  export enum PathSegments {
    ABOUT = ShellPathSegments.ABOUT,
    BED_OCCUPANCY = 'bed-occupancy',
    DISEASE_NOTIFICATION = 'disease-notification',
    SITE_NOTICE = ShellPathSegments.SITE_NOTICE,
    PATHOGEN_NOTIFICATION = 'pathogen-notification',
    NON_NOMINAL = '/7.3/non-nominal',
    PATHOGEN_NOTIFICATION_FOLLOW_UP = 'pathogen-notification/7.1/follow-up',
    PATHOGEN_NOTIFICATION_NON_NOMINAL = 'pathogen-notification/7.3/non-nominal',
    DISEASE_NOTIFICATION_NON_NOMINAL = 'disease-notification/7.3/non-nominal',
    PRIVACY_POLICY = ShellPathSegments.PRIVACY_POLICY,
    SEQUENCE_NOTIFICATION = 'sequence_notification',
    WELCOME = ShellPathSegments.WELCOME,
  }

  export enum Tabs {
    BED_OCCUPANCY = PathSegments.BED_OCCUPANCY,
    HOME = PathSegments.WELCOME,
    SEQUENCE_NOTIFICATION = PathSegments.SEQUENCE_NOTIFICATION,
    PATHOGEN_TEST_RESULTS = PathSegments.PATHOGEN_NOTIFICATION,
  }

  export enum ExternalLinks {
    DATA_ANALYSIS = 'https://go.gematik.de/demisanalyse',
    DEMIS_WDB = 'https://wiki.gematik.de/display/DSKB',
    CONTACT_SUPPORT = 'https://go.gematik.de/demis-support',
  }

  export enum Labels {
    ABOUT_DEMIS_LINK = 'Über DEMIS',
    DATA_ANALYSIS_LINK = 'Infektionsradar',
    DEMIS_KNOWLEDGE_DATABASE_LINK = 'DEMIS-Wissensdatenbank',
    HELP_LINK = 'Hilfe',
    SITE_NOTICE_LINK = 'Impressum',
    PRIVACY_POLICY = 'Datenschutzerklärung',
    START_PAGE_LINK = 'Startseite',
    SUBMIT_BED_OCCUPANCY_LINK = 'Bettenbelegung',
    SUPPORT_QUESTIONS_LINK = 'Supportanfragen',
  }

  export enum InfoTexts {
    ABOUT = 'Das Deutsche Elektronische Melde- und Informationssystem für den Infektionsschutz (DEMIS) ermöglicht bundesweit die elektronische Meldung gemäß Infektionsschutzgesetz (IfSG). Über das DEMIS-Meldeportal können Meldepflichtige Meldungen gemäß IfSG über ein Online-Formular absetzen.',
    KNOWLEDGE_DATABASE = 'Nähere Informationen zu DEMIS finden Sie hier:',
    BED_OCCUPANCY = 'Meldung der Krankenhausbettenbelegung gemäß § 13 Abs. 7 IfSG',
    DISEASE = 'Meldung von meldepflichtigen Infektionskrankheiten (z.B. bei Verdacht, Erkrankung oder Tod) gemäß § 6 Abs. 1 Nr. 1 und 1a IfSG sowie § 6 Abs. 2 IfSG',
    PATHOGEN = 'Meldung eines Nachweises von Krankheitserregern (inkl. positive Schnelltestergebnisse) gemäß § 7 Abs. 1 IfSG',
    PATHOGEN_SHORT = 'Meldung eines Nachweises von Krankheitserregern gemäß § 7 Abs. 1 IfSG',
    PATHOGEN_FOLLOW_UP = 'Nichtnamentliche Folgemeldung eines Erregernachweises gemäß § 7 Abs. 1 IfSG',
    NON_NOMINAL = 'Meldung eines Erregernachweises oder ärztliche Ergänzung gemäß § 7 Abs. 3 IfSG: C. trachomatis (L1-L3), Echinococcus spp., HIV, N. gonorrhoeae, T. gondii & T. pallidum',
    PATHOGEN_NON_NOMINAL = 'Meldung von meldepflichtigen Infektionskrankheiten gemäß § 7 Abs. 3 IfSG',
    DISEASE_NON_NOMINAL = 'Meldung eines Nachweises von Krankheitserregern gemäß § 7 Abs. 3 IfSG',
    SEQUENCE_NOTIFICATION = 'Übermittlung von Sequenz- und Sequenzmetadaten für die Integrierte Genomische Surveillance gemäß § 13 Abs. 3 IfSG',
  }

  export namespace Titles {
    export const BED_OCCUPANCY = ['Bettenbelegung'];
    export const DISEASE = ['Meldung einer Krankheit gemäß § 6 IfSG'];
    export const PATHOGEN = ['Meldung eines Erregernachweises gemäß § 7 Abs. 1 IfSG'];
    export const NON_NOMINAL = ['Meldung gemäß § 7 Abs. 3 IfSG'];
    export const PATHOGEN_NON_NOMINAL = ['Erregernachweis melden'];
    export const DISEASE_NON_NOMINAL = ['Ärztliche Ergänzungsmeldung'];
    export const PATHOGEN_ANONYMOUS = ['Erregernachweis melden (Anonym)'];
    export const DISEASE_ANONYMOUS = ['Ärztliche Ergänzungsmeldung (Anonym)'];
    export const SEQUENCE_NOTIFICATION = ['IGS'];
    export const SEQUENCE_NOTIFICATION_NEW = ['Integrierte Genomische Surveillance', '(IGS)'];
  }

  export enum Messages {
    AUTHENTICATION_ERROR = 'Sie haben nicht die nötigen Rechte um die Seite aufzurufen!',
  }

  export enum Tooltips {
    CLICK_TO_REPORT = 'Klicken Sie, um einen neuen Fall zu melden',
    CLICK_TO_OPEN = 'Klicken Sie, um zur Auswahl der Meldungsart zu kommen',
    UPLOAD_INFO = 'Klicken Sie, um einen neuen Fall hoch zu laden',
  }

  export enum Roles {
    BED_OCCUPANCY_SENDER = 'bed-occupancy-sender',
    DISEASE_NOTIFICATION_SENDER = 'disease-notification-sender',
    PATHOGEN_NOTIFICATION_SENDER = 'pathogen-notification-sender',
    PATHOGEN_NOTIFICATION_NON_NOMINAL_SENDER = 'pathogen-notification-nonnominal-sender',
    DISEASE_NOTIFICATION_NON_NOMINAL_SENDER = 'disease-notification-nonnominal-sender',
    IGS_SEQUENCE_DATA_SENDER = 'igs-sequence-data-sender',
    IGS_NOTIFICATION_DATA_SENDER = 'igs-notification-data-sender',
    IGS_NOTIFICATION_DATA_SENDER_FASTA_ONLY = 'igs-sequence-data-sender-fasta-only',
  }
}
