## Overview

This project is a small full-stack resort cabana booking application.

It renders a resort map from an ASCII map file, exposes the map through a REST API, and allows users to book available cabanas by providing a room number and guest name. Guest validation is based on the provided bookings file. After a successful booking, the map is refreshed and the selected cabana becomes unavailable.

The solution consists of:

- an Angular frontend responsible for rendering the resort map and handling the booking flow,
- a Node.js + Express backend responsible for loading input files, validating bookings, exposing the REST API, and serving the built frontend.

The application is intentionally kept small and focused on the required functionality.

## Requirements

- Node.js
- npm

## Install

From the project root:

```bash
npm install
```

## Run

From the project root:

```bash
npm run start -- --map ./map.ascii --bookings ./bookings.json
```

This command:

- builds the Angular frontend,
- starts the Node.js backend,
- serves both the UI and the API from a single server.

After startup, open:

```text
http://localhost:3000
```

## Run tests

### Run all tests

From the project root:

```bash
npm test
```

### Run backend tests only

From the project root:

```bash
npm run test:server
```

### Run frontend tests only

From the project root:

```bash
npm run test:client
```

The frontend tests run once in headless Chrome.

## Notes

- The startup command accepts custom input files through `--map` and `--bookings`.
- Booking state is stored in memory only and is reset when the server restarts.

## Design choices

### Keep the architecture small

The project uses a minimal structure on both frontend and backend.

On the frontend, the application logic is kept in `AppComponent`, while `ResortMapComponent` is responsible for rendering the map grid. I intentionally avoided adding extra page-level wrappers, global state management, or additional abstraction layers because the application only has one main screen and a single primary user flow.

On the backend, the code is split into a few small files with clear responsibilities:
- file loading,
- map parsing,
- booking state and validation,
- API routes,
- application bootstrap.

I avoided adding repositories, custom error hierarchies, controllers, or other patterns that would add structure without improving this specific solution.

### Backend as the source of truth

The frontend relies entirely on the REST API for the current map state. After a successful booking, it reloads the map from the backend instead of updating local UI state manually.

This keeps the data flow simple and ensures the backend remains the single source of truth for cabana availability.

### Simple in-memory booking state

Cabana bookings are stored in memory only. This matches the requirements and avoids adding unnecessary persistence. Restarting the server resets the booking state.

### Presentation logic kept on the frontend

The backend returns a simple map structure with tile types and cabana availability. The frontend is responsible for visual rendering, including the tile images and path shape selection.

I kept that logic in the frontend because it is purely visual and does not affect business behavior.

### Validation kept practical

Booking is allowed only when:
- the cabana exists,
- the cabana is still available,
- room number and guest name are provided,
- the room number and guest name match a valid guest from the bookings file.

Guest name matching is case-insensitive to make the form a bit more user-friendly while still keeping validation strict enough for the task.

### Tests focused on core behavior

Automated tests cover the core application flow instead of implementation details.

Backend tests cover:
- booking rules,
- REST API behavior,
- map updates after booking.

Frontend tests cover:
- map loading,
- UI response to selecting cabanas,
- successful and unsuccessful booking attempts.
