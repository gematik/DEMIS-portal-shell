/*
 Copyright (c) 2025 gematik GmbH
 Licensed under the EUPL, Version 1.2 or - as soon they will be approved by
 the European Commission - subsequent versions of the EUPL (the "Licence");
 You may not use this work except in compliance with the Licence.
    You may obtain a copy of the Licence at:
    https://joinup.ec.europa.eu/software/page/eupl
        Unless required by applicable law or agreed to in writing, software
 distributed under the Licence is distributed on an "AS IS" basis,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the Licence for the specific language governing permissions and
 limitations under the Licence.
 */

export namespace AppConstants {
  export enum PathSegments {
    ABOUT = 'about',
    AUTHENTICATION = 'authentication',
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
    SITE_NOTICE = PathSegments.SITE_NOTICE,
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
    DATA_ANALYSIS_INFO = 'Klicken Sie, um Daten zu melde­pflichtigen Infektions­krankheiten abzufragen',
    DATA_ANALYSIS_LINK = 'Infektionsradar',
    DEMIS_KNOWLEDGE_DATABASE_LINK = 'DEMIS-Wissensdatenbank',
    HELP_LINK = 'Hilfe',
    SITE_NOTICE_LINK = 'Impressum',
    POSITIVE_TEST_RESULT_LINK = 'Positives SARS-CoV-2-Testergebnis melden',
    PRIVACY_POLICY = 'Datenschutzerklärung',
    START_PAGE_LINK = 'Startseite',
    SUBMIT_BED_OCCUPANCY_LINK = 'Bettenbelegung melden',
    SUBMIT_DISEASE_LINK = 'Krankheit melden',
    SUBMIT_SEQUENCE_NOTIFICATION_LINK = 'Sequenzdaten übermitteln',
    SUPPORT_QUESTIONS_LINK = 'Supportanfragen',
  }

  export enum InfoTexts {
    ABOUT = 'Das Deutsche Elektronische Melde- und Informationssystem für den Infektionsschutz (DEMIS) ermöglicht die elektronische Meldung von melde­pflichtigen Infektionskrankheiten an das zuständige Gesundheitsamt.',
    ABOUT_NEW = 'Das Deutsche Elektronische Melde- und Informationssystem für den Infektionsschutz (DEMIS) ermöglicht bundesweit die elektronische Meldung gemäß Infektionsschutzgesetz (IfSG). Über das DEMIS-Meldeportal können Meldepflichtige Meldungen gemäß IfSG über ein Online-Formular absetzen.',
    KNOWLEDGE_DATABASE = 'Nähere Informationen zu DEMIS finden Sie hier:',
    BED_OCCUPANCY = 'Meldung der Krankenhausbettenbelegung gemäß Infektionsschutzgesetz (§ 13 Abs. 7 IfSG)',
    DATA_ANALYSIS = 'Hier können Daten zu melde­pflichtigen Infektions­krankheiten abgefragt werden. Durch individuell erstellte Abfragen lassen sich Tabellen und Grafiken erzeugen.',
    DISEASE = 'Meldung von meldepflichtigen Infektionskrankheiten (z.B. bei Verdacht, Erkrankung oder Tod) gemäß Infektionsschutzgesetz (§ 6 IfSG)',
    PATHOGEN = 'Meldung von Nachweisen von Krankheitserregern (inkl. positive Schnelltestergebnisse) gemäß Infektionsschutzgesetz (§ 7 Abs. 1 IfSG)',
    SEQUENCE_NOTIFICATION = 'Meldung von Sequenz- und Sequenzmetadaten gemäß Infektionsschutzgesetz (§13 Abs. 3 IfSG)',
  }

  export namespace Titles {
    export const ABOUT = ['Was ist DEMIS?', ''];
    export const BED_OCCUPANCY = ['Bettenbelegung', 'melden'];
    export const DISEASE = ['Krankheit', 'melden'];
    export const PATHOGEN = ['Erregernachweis', 'melden'];
    export const SEQUENCE_NOTIFICATION = ['IGS', ''];
  }

  export enum Messages {
    AUTHENTICATION_ERROR = 'Sie haben nicht die nötigen Rechte um die Seite aufzurufen!',
  }

  export enum Tooltips {
    ABOUT = 'Klicken Sie, um mehr über das DEMIS-System zu erfahren',
    CLICK_TO_REPORT = 'Klicken Sie, um einen neuen Fall zu melden',
    UPLOAD_INFO = 'Klicken Sie, um einen neuen Fall hoch zu laden',
  }
}
