# Shutter Speed Report

This is a 100% client side web application that is designed to produce service reports for cameras. It includes:

* The ability to log observed shutter speeds against expected shutter speeds
* A report of the EV difference from expected
* A graph showing the shutter speed and its variation from expected
* A log of actions performed on the camera
* Metadata about the camera (name, model, serial number, dates, etc)

Once the report has been generated it is also possible to download it as a pdf.

Previous reports are stored in local browser storage for future reference.

## Tech Stack

* Written in Typescript
* React as the front-end framework
* Uses esbuild for bundling and compilation
* Linting using eslint
* Tested using jest for react components
* Browser tested using Cypress
