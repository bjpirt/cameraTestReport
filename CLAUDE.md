# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side web application for generating camera shutter speed service reports. Features include shutter speed logging with EV difference calculations, graphical visualizations, action logs, camera metadata, PDF export, and local storage persistence.

## Tech Stack

- TypeScript with React
- esbuild for bundling/compilation
- ESLint for linting
- Jest for React component testing
- Cypress for browser/E2E testing

## Build Commands

```bash
# Build (once configured)
npm run build

# Lint
npm run lint

# Unit tests
npm test

# Single test file
npm test -- <test-file-name>

# E2E tests
npm run cypress
```

## Architecture

This is a 100% client-side application with no backend. All data is stored in browser local storage.
