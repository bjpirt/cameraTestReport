# Shutter Speed Report

A client-side web application for generating camera shutter speed service reports.

## Features

- Log observed vs expected shutter speeds with EV difference calculations
- Graphical visualization of shutter speed variance
- Action log for camera servicing
- Camera metadata (name, model, serial number, dates)
- PDF export
- Local storage persistence for previous reports

## Tech Stack

TypeScript, React 19, Tailwind CSS v4, esbuild, ESLint, Jest, Cypress

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:8000
npm run build        # Production build
npm run typecheck    # Type check
npm run lint         # Lint
npm test             # Run tests
npm run cypress      # E2E tests (interactive, requires dev server)
npm run cypress:run  # E2E tests (headless, requires dev server)
```
