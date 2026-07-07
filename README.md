# KAVACH AI

KAVACH AI is a multi-surface fraud detection and investigation platform with:
- a public and investigator web app (`/src`)
- a FastAPI backend (`/backend`)
- an Expo mobile app (`/mobile-app`)

## Repository Structure

- `/src` — React + Vite web app (public pages, citizen shield, investigator intelligence workspace)
- `/backend` — FastAPI API, SQLAlchemy models, services, and tests
- `/mobile-app` — React Native (Expo) mobile client
- `/API_INTEGRATION.md` — frontend/backend endpoint contract
- `/LOCAL_DEMO.md` — local demo account notes

## Core Capabilities

- Public scam text analysis (`/shield`) with no login required
- Citizen-authenticated report submission and report history
- Investigator dashboard with metrics, charts, and live alert feed
- Case management, entity exploration, fraud cluster investigation
- Network graph intelligence and geospatial hotspot intelligence
- Assistant and live analysis endpoints in the backend API

## Tech Stack

### Web
- React 19 + Vite + TypeScript
- React Router, Zustand, TanStack Query
- Recharts, React Leaflet, Cytoscape.js

### Backend
- FastAPI, SQLAlchemy (async), Alembic
- PostgreSQL (local via Docker Compose)
- Pytest for automated tests

### Mobile
- React Native + Expo
- React Navigation

## Quick Start

## 1) Web App

From repository root:

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

Optional checks:

```bash
npm run lint
npm run build
```

## 2) Backend API

From `/backend`:

```bash
python -m pip install -r requirements.txt
cp .env.example .env
docker compose up -d
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://localhost:8000/docs`

Useful endpoints:
- Health: `GET /health`
- Readiness: `GET /ready`
- Versioned API root: `/api/v1/*`

## 3) Mobile App

From `/mobile-app`:

```bash
npm install
npm start
```

Then run Android/iOS/web through Expo options.

## Testing

### Web
```bash
npm run lint
npm run build
```

### Backend
From `/backend`:

```bash
pytest tests
```

Note: `backend/test_api.py` is an integration script that expects a running backend at `localhost:8000`.

## Local Demo Accounts

See `/LOCAL_DEMO.md` for development/demo credentials and usage notes.
