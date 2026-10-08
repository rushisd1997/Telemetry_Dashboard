# Telemetry Monitor - Angular + Electron + Node.js

Assessment for telemetry monitoring application.

## Used Stack

- Angular 20 + TypeScript
- Electron
- Node.js + Express
- Chartjs real-time trend charts

## Current Project structure

```text
telemetry-monitor/
├── backend/          Express API and telemetry simulator
├── desktop/          Electron main process
├── frontend/         Angular 20 application
├── package.json      Root scripts
└── README.md
```

- `DashboardService` handles API polling and keeps the latest dashboard data.
- `UnitConversionService` contains the conversion formulas and unit metadata.
- `ExportService` creates CSV and Excel files from collected samples.
- `TelemetryCardComponent` handles one metric card and its gauge.
- `TrendChartComponent` renders a chart so the chart behavior is visible.
- Electron only provides the desktop shell and loads the Angular application.
- The Node backend owns telemetry generation and history.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- Windows OS as it is electron app for windows.

## Install

## To install all modules in one go execute:

From the project root:

```bash
npm run install:all
```

The `install:all` command installs the root tooling and then installs the frontend, backend and Electron dependencies.

## To install modules individually for Frontend, Backend, Electron go to individual directories and execute:

```bash
npm install
```

## Run in development

```bash
npm start
```

This starts:

- Angular: http://localhost:4200
- Backend: http://localhost:3001
- Electron: desktop application

The Electron window loads the Angular application automatically.

## Build Angular

```bash
npm run build
```

The build will get generated in `dist` folder

## Assumptions

1. The backend is the simulated embedded-controller source.
2. Base units are cm/s, mbar and °C based on the supplied API example.