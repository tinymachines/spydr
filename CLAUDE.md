# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright test automation project for end-to-end testing and web automation. The project uses TypeScript and is configured for cross-browser testing.

## Essential Commands

Since no npm scripts are currently defined in package.json, use these Playwright CLI commands directly:

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run a specific test file
npx playwright test tests/example.spec.ts

# Run tests in debug mode
npx playwright test --debug

# Generate tests using recorder
npx playwright codegen

# Show HTML test report
npx playwright show-report

# Install browsers (required after initial setup)
npx playwright install
```

## Project Structure

- `/tests/` - Main test directory for active test files
- `/tests-examples/` - Example test files for reference
- `playwright.config.ts` - Main configuration file defining test settings, browsers, and reporter options

## Key Architecture Notes

1. **Test Framework**: Uses Playwright Test with TypeScript for type safety
2. **Browser Support**: Configured for Chromium, Firefox, and WebKit
3. **Parallel Execution**: Tests run in parallel with configurable workers
4. **Reporting**: HTML reporter generates test results in `playwright-report/`
5. **Debugging**: Traces are collected on test retry for debugging failures

## Test Pattern

Tests follow the standard Playwright pattern:
- Use `test.describe()` for grouping related tests
- Use `test()` for individual test cases
- All test functions are async
- Page interactions use Playwright's auto-waiting mechanisms