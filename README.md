<p align="center">
  <img src="src/assets/logo.svg" alt="Pecuniae" width="420" />
</p>

# Pecuniae

Pecuniae is a private, local-first desktop application for tracking personal income and expenses. It is designed to make everyday transaction entry quick while providing useful monthly and all-time visual summaries without sending financial data to an external service.

## Features

- Record, edit, and delete income and expenses.
- Organize transactions with reusable custom categories.
- Browse transactions and totals by month.
- View total balance and monthly income and expenses.
- Compare categories through pie and bar charts.
- Temporarily exclude categories from visual analysis.
- Switch between light and dark themes.
- Store money as integer cents to avoid floating-point rounding errors.
- Persist all data locally in SQLite.

## Technology and architecture

Pecuniae uses Electron Forge, Vite, TypeScript, React, Sass modules, and `better-sqlite3`.

The React renderer never accesses SQLite or Node.js directly. Database operations run exclusively in Electron's main process and are exposed through a small typed preload API. The browser window keeps `contextIsolation` enabled, `nodeIntegration` disabled, and the renderer sandbox enabled.

Database schema changes are applied through versioned migrations when the application starts. Default accounts and categories are seeded automatically.

## Requirements

- Node.js
- npm
- Platform build tools supported by Electron Forge

## Install and start

Install the dependencies:

```bash
npm install
```

Start the application in development mode:

```bash
npm start
```

Vite provides hot-module replacement for React and Sass changes. Changes to the preload script reload the window, while changes to the Electron main process restart the application.

## Validation

Run the TypeScript compiler, lint checks, and database persistence test:

```bash
npm run typecheck
npm run lint
npm run test:db
```

Automatically fix supported formatting and lint issues:

```bash
npm run lint:fix
```

## Build the desktop application

Create an unpacked application for the current platform:

```bash
npm run package
```

Create distributable installers or archives configured by Electron Forge:

```bash
npm run make
```

Generated artifacts are written to the `out/` directory.

## Local data and backups

The SQLite database is named `pecuniae.sqlite3` and is stored in Electron's application data directory. Typical locations are:

- macOS development: `~/Library/Application Support/Electron/pecuniae.sqlite3`
- macOS packaged app: `~/Library/Application Support/Pecuniae/pecuniae.sqlite3`
- Windows: `%APPDATA%/Pecuniae/pecuniae.sqlite3`
- Linux: `~/.config/Pecuniae/pecuniae.sqlite3`

To create a reliable backup, fully quit Pecuniae and copy `pecuniae.sqlite3` to a safe location. The database uses write-ahead logging, so copying it while the application is open can omit recent changes. Restoring the database file preserves accounts, categories, and transactions; pending schema migrations are applied automatically the next time Pecuniae starts.

Development and packaged builds use different application-data directories. To move development data into a packaged build, quit both applications and copy the development database into the packaged application's directory.

## Project structure

```text
src/
├── assets/            Logo and other static assets
├── components/        React components and scoped Sass modules
├── styles/            Global theme variables and base styles
├── database.ts        SQLite schema, migrations, queries, and validation
├── main.ts            Electron main process and IPC handlers
├── preload.ts         Secure typed renderer bridge
├── renderer.tsx       React entry point
└── shared.ts          Types shared across process boundaries
```
