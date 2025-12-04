# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side web application for generating camera shutter speed service reports. Features include shutter speed logging with EV difference calculations, graphical visualizations, action logs, camera metadata, PDF export, and local storage persistence.

## Tech Stack

- TypeScript 5.x with React 19
- esbuild for bundling/compilation
- ESLint for linting
- Jest for React component testing
- Cypress for browser/E2E testing

## Development Setup

Requires Node.js (managed via nvm). Run `nvm use` to ensure correct version.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:8000
npm run build        # Production build to public/dist/
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm test             # Run Jest unit tests
npm test -- <file>   # Run single test file
npm run test:watch   # Run tests in watch mode
npm run typecheck    # TypeScript type checking
npm run cypress      # Open Cypress UI for E2E tests
npm run cypress:run  # Run Cypress tests headlessly
```

## Architecture

This is a 100% client-side application with no backend. All data is stored in browser local storage.
