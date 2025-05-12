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

export function isNewDesignActivated(): boolean {
  return environment?.featureFlags?.FEATURE_FLAG_NEW_STARTPAGE_DESIGN ?? false;
}

export function isNonNominalNotificationActivated(): boolean {
  return (isNewDesignActivated() && environment.featureFlags?.FEATURE_FLAG_NON_NOMINAL_NOTIFICATION) ?? false;
}

export namespace AppConstants {
  export enum PathSegments {
    ABOUT = 'about',
    BED_OCCUPANCY = 'bed-occupancy',
    DISEASE_NOTIFICATION = 'disease-notification',
    SITE_NOTICE = 'impressum',
    PATHOGEN_NOTIFICATION = 'pathogen-notification',
    PRIVACY_POLICY = 'privacy-policy',
    SEQUENCE_NOTIFICATION = 'sequence_notification',
    WELCOME = 'welcome',
  }

  export enum Tabs {
    BED_OCCUPANCY = PathSegments.BED_OCCUPANCY,
    HOME = PathSegments.WELCOME,
    SEQUENCE_NOTIFICATION = PathSegments.SEQUENCE_NOTIFICATION,
    PATHOGEN_TEST_RESULTS = PathSegments.PATHOGEN_NOTIFICATION,
  }

  export enum ExternalLinks {
    DATA_ANALYSIS = 'http://go.gematik.de/demisanalyse',
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
    SUBMIT_BED_OCCUPANCY_LINK = 'Bettenbelegung melden',
    SUPPORT_QUESTIONS_LINK = 'Supportanfragen',
  }

  export enum InfoTexts {
    ABOUT = 'Das Deutsche Elektronische Melde- und Informationssystem für den Infektionsschutz (DEMIS) ermöglicht die elektronische Meldung von melde­pflichtigen Infektionskrankheiten an das zuständige Gesundheitsamt.',
    ABOUT_NEW = 'Das Deutsche Elektronische Melde- und Informationssystem für den Infektionsschutz (DEMIS) ermöglicht bundesweit die elektronische Meldung gemäß Infektionsschutzgesetz (IfSG). Über das DEMIS-Meldeportal können Meldepflichtige Meldungen gemäß IfSG über ein Online-Formular absetzen.',
    KNOWLEDGE_DATABASE = 'Nähere Informationen zu DEMIS finden Sie hier:',
    BED_OCCUPANCY = 'Meldung der Krankenhausbettenbelegung gemäß Infektionsschutzgesetz (§ 13 Abs. 7 IfSG)',
    DISEASE = 'Meldung von meldepflichtigen Infektionskrankheiten (z.B. bei Verdacht, Erkrankung oder Tod) gemäß Infektionsschutzgesetz (§ 6 Abs. 1 IfSG)',
    PATHOGEN = 'Meldung von Nachweisen von Krankheitserregern (inkl. positive Schnelltestergebnisse) gemäß Infektionsschutzgesetz (§ 7 Abs. 1 IfSG)',
    NON_NOMINAL = 'Krankheit oder Erregernachweis melden für nichtnamentliche Meldungen: Chlamydia trachomatis, Echinococcus sp., HIV, Neisseria gonorrhoeae, Toxoplasma gondii und Treponema pallidum',
    PATHOGEN_NON_NOMINAL = 'Meldepflichtige Infektionskrankheiten (z.B. bei Verdacht, Erkrankung oder Tod)',
    DISEASE_NON_NOMINAL = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam eirmod tempor invidunt ut.',
    SEQUENCE_NOTIFICATION = 'Meldung von Sequenz- und Sequenzmetadaten gemäß Infektionsschutzgesetz (§ 13 Abs. 3 IfSG)',
    SEQUENCE_NOTIFICATION_NEW_DESIGN = 'Übermittlung von Sequenz- und Sequenzmetadaten gemäß Infektionsschutzgesetz (§ 13 Abs. 3 IfSG)',
  }

  export namespace Titles {
    export const ABOUT = ['Was ist DEMIS?', ''];
    export const BED_OCCUPANCY = ['Bettenbelegung', 'melden'];
    export const DISEASE = ['Krankheit', 'melden'];
    export const DISEASE_NEW = ['Krankheitsmeldung § 6 Abs. 1 IfSG'];
    export const PATHOGEN = ['Erregernachweis', 'melden'];
    export const PATHOGEN_NEW = ['Erregernachweise § 7 Abs. 1 IfSG'];
    export const NON_NOMINAL = ['§ 7 Abs. 3 IfSG'];
    export const PATHOGEN_NON_NOMINAL = ['Erregernachweis melden (§ 7.3)'];
    export const DISEASE_NON_NOMINAL = ['Ärztliche Ergänzungsmeldung (§ 7.3)'];
    export const PATHOGEN_ANONYMOUS = ['Erregernachweis melden (Anonym)'];
    export const DISEASE_ANONYMOUS = ['Ärztliche Ergänzungsmeldung (Anonym)'];
    export const SEQUENCE_NOTIFICATION = ['IGS'];
    export const SEQUENCE_NOTIFICATION_NEW = ['Integrierte genomische Surveillance', '(IGS)'];
  }

  export enum Messages {
    AUTHENTICATION_ERROR = 'Sie haben nicht die nötigen Rechte um die Seite aufzurufen!',
  }

  export enum Tooltips {
    ABOUT = 'Klicken Sie, um mehr über das DEMIS-System zu erfahren',
    CLICK_TO_REPORT = 'Klicken Sie, um einen neuen Fall zu melden',
    //TODO richtige Texte hier
    CLICK_TO_OPEN = 'Klicken Sie, um die § 7.3 Kacheln zu sehen',
    UPLOAD_INFO = 'Klicken Sie, um einen neuen Fall hoch zu laden',
  }
}
