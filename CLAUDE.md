# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side web application for generating camera shutter speed service reports. Features include shutter speed logging with EV difference calculations, graphical visualizations, action logs, camera metadata, PDF export, and local storage persistence.

## Tech Stack

- TypeScript 5.x with React 19
- Tailwind CSS v4 for styling
- esbuild for bundling/compilation (with PostCSS plugin)
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

## Task Completion Checklist

Before considering any task complete, run all checks:

```bash
npm run typecheck && npm run lint && npm test
```

All three must pass with no errors.

## Architecture

This is a 100% client-side application with no backend. All data is stored in browser local storage.

## Development Principles

### Testing (TDD Preferred)

- Write tests first when feasible: red → green → refactor
- Unit test pure functions and business logic thoroughly
- Use React Testing Library for component tests - test behavior, not implementation
- Keep tests focused: one concept per test
- Name tests descriptively: `it("calculates EV difference for faster shutter speed")`
- **Cypress E2E tests**: After any changes to app behavior, update `cypress/e2e/` tests to cover the new functionality

### TypeScript

- Use strict mode (enabled in tsconfig)
- Prefer explicit types for function signatures and public APIs
- Use type inference for local variables
- Avoid `any` - use `unknown` with type guards when type is truly unknown
- Use discriminated unions over type assertions

### Code Quality (SOLID, but Simple)

- **Single Responsibility**: Each function/component does one thing well
- **Open/Closed**: Extend behavior through composition, not modification
- **Liskov Substitution**: Subtypes must be substitutable for their base types
- **Interface Segregation**: Prefer small, focused interfaces
- **Dependency Inversion**: Depend on abstractions (props, interfaces) not concretions

### Simplicity Over Complexity

- Prefer plain functions over classes unless state encapsulation is needed
- Avoid premature abstraction - duplication is cheaper than wrong abstraction
- Three instances of similar code before extracting a pattern
- No speculative generality - build for current requirements
- Flat is better than nested - avoid deep component hierarchies

### React Patterns

- Functional components with hooks
- Colocate state with the components that use it
- Lift state up only when necessary for sharing
- Custom hooks for reusable stateful logic
- Props for configuration, children for composition

### Tailwind CSS

- Use utility classes directly in JSX
- Avoid `@apply` unless extracting truly reusable patterns
- Prefer component composition over CSS abstraction
- Keep class strings readable - split long ones across lines if needed
- Custom configuration goes in `src/styles.css` using CSS variables

### Naming Conventions

- Components: PascalCase (`ShutterSpeedInput.tsx`)
- Hooks: camelCase with `use` prefix (`useLocalStorage.ts`)
- Utils/helpers: camelCase (`calculateEvDifference.ts`)
- Types/interfaces: PascalCase (`CameraReport`, `ShutterReading`)
- Constants: SCREAMING_SNAKE_CASE for true constants

### File Organization

```
src/
  components/     # React components
  hooks/          # Custom React hooks
  utils/          # Pure utility functions
  types/          # TypeScript type definitions
  styles.css      # Tailwind CSS entry point
  App.tsx         # Root component
  index.tsx       # Entry point
```
