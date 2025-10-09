<img align="right" width="250" height="47" src="./media/Gematik_Logo_Flag.png"/> <br/>    

# Release portal-shell

## Release 1.4.0

- Fixed layout issues in the welcome component when information banners are displayed
- Fixed layout issues with the footer and the tiles
- Upgraded dependencies
- Added test:coverage npm script to run a single test run with coverage report
- Added destination-lookup route to proxy configuration
- add configmap checksum as annotation to force pod restart on configmap change
- Update @angular-devkit/build-angular to 19.2.17
- Resolved focus issue with navbar menu buttons

## Release 1.3.0
- Added sub-tiles and routing for follow-up notification (FEATURE_FLAG_FOLLOW_UP_NOTIFICATION)
- resized "Finanziert von der Europäischen Union" logo
- Switched to the library implementation of the DEMIS theme using Portal-Theme
- Add new API endpoints activated by feature flag FEATURE_FLAG_NEW_API_ENDPOINTS

## Release 1.2.7
- Upgraded to Angular 19

## Release 1.2.6
- logo and text adaptions for § 7.3
- added "Finanziert von der Europäischen Union" logo to landing page

## Release 1.2.5
- changed default color for input outlines and input labels
- added functionality to show information banners above the top navigation bar (FEATURE_FLAG_PORTAL_INFOBANNER)
- added functionality to show a stage indicator banner above the top navigation bar, to highlight dedicated stages (FEATURE_FLAG_PORTAL_INFOBANNER)
- Updated Readme license disclaimer
- Include new roles for §7.3 notification (non nominal)
- Routing for §7.3 notification (non nominal) to portal-pathogen & portal-disease

## Release 1.2.4
- Updated Portal-Core Library version
- Adjusted border-radius for some elements

## Release 1.2.3
- Updated ospo-resources for adding additional notes and disclaimer
- Added sub-tiles for non-nominal notification (FEATURE_FLAG_NON_NOMINAL_NOTIFICATION)
- Adjusted navbar styling and colors

## Release 1.2.2
- Add new font and background color

## Release 1.2.1
- New wording for igs tile

## Release 1.2.0
- First official GitHub-Release
