# WebGIS Project

Full-stack GIS application for visualizing ward boundaries, roads, and rivers on an interactive map, with JWT authentication and role-based access control.

## Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js, TypeScript, React Leaflet |
| Backend | NestJS, TypeORM, Passport JWT |
| Database | PostgreSQL, PostGIS |

## Features

- Ward boundary visualization and search
- Road and river layer overlays
- Current location detection with ward lookup
- JWT login and role-based authorization (ADMIN / USER)

## Repository layout

```
webgis-project/
├── webgis-client/     # Next.js frontend
├── webgis-api/        # NestJS backend
├── infra/postgres/    # Database migrations and setup
└── docs/              # Cross-cutting architecture and API reference
```

## Module documentation

Each module has its own `README.md` for AI context and developer reference.

### Frontend (`webgis-client/`)

| Module | Path | Description |
|--------|------|-------------|
| App | [app/README.md](webgis-client/app/README.md) | Routes and page composition |
| Auth UI | [components/auth/README.md](webgis-client/components/auth/README.md) | Login gate and user panel |
| Map | [components/map/README.md](webgis-client/components/map/README.md) | Leaflet map, layers, hooks |
| Context | [context/README.md](webgis-client/context/README.md) | Global auth state |
| API client | [lib/README.md](webgis-client/lib/README.md) | Backend URL helpers |

See also [webgis-client/README.md](webgis-client/README.md) for setup and env vars.

### Backend (`webgis-api/`)

| Module | Path | Description |
|--------|------|-------------|
| Auth | [src/modules/auth/README.md](webgis-api/src/modules/auth/README.md) | Login, JWT, guards |
| Users | [src/modules/users/README.md](webgis-api/src/modules/users/README.md) | User CRUD and entity |
| Wards | [src/modules/wards/README.md](webgis-api/src/modules/wards/README.md) | Ward GeoJSON and spatial queries |
| Roads | [src/modules/roads/README.md](webgis-api/src/modules/roads/README.md) | Road GeoJSON |
| Rivers | [src/modules/rivers/README.md](webgis-api/src/modules/rivers/README.md) | River GeoJSON |

See also [webgis-api/README.md](webgis-api/README.md) for setup and env vars.

### Infrastructure

| Module | Path | Description |
|--------|------|-------------|
| PostgreSQL | [infra/postgres/README.md](infra/postgres/README.md) | Schema, migrations, PostGIS |

### Cross-cutting docs

- [docs/architecture.md](docs/architecture.md) — system overview
- [docs/api.md](docs/api.md) — HTTP endpoint reference
- [docs/database.md](docs/database.md) — table and column reference

## Quick start

1. Create the database and run migrations — see [infra/postgres/README.md](infra/postgres/README.md).
2. Start the API (`webgis-api`, default port 3001).
3. Start the client (`webgis-client`, default port 3000) with `NEXT_PUBLIC_API_URL` pointing at the API.
