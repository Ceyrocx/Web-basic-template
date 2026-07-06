# 🚀 Fullstack Starter — React + FastAPI + Postgres (Dockerized)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-UI-339AF0?logo=mantine&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1-000000?logo=bun&logoColor=white)
![uv](https://img.shields.io/badge/uv-Python-DE5FE9?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

> Un **repo de base** à copier-coller à chaque nouveau projet. Objectif : un fullstack **typé de bout en bout**, migré, testé, linté et dockerisé (dev **+** prod), prêt à lancer en une commande — et assez commenté pour comprendre **à quoi sert chaque fichier**.

Petite app de démo incluse : une page **« Hello World »** + un **formulaire** qui ajoute un item en base et affiche la liste.

---

## 🧱 La stack

| Couche | Techno | Rôle |
|---|---|---|
| **Frontend** | Bun · React 19 · Vite 8 · TypeScript | base du front |
| | **Mantine** | composants UI + thème |
| | **Tailwind v4** | classes utilitaires |
| | **TanStack Query** | data-fetching + cache |
| | **React Router** | navigation |
| | **Zod** + `mantine-form-zod-resolver` | validation (types + formulaires) |
| | **oxlint** | linter |
| **Backend** | **FastAPI** (ASGI, uvicorn) | API |
| | **SQLModel** | ORM (SQLAlchemy + Pydantic) |
| | **Pydantic Settings** | config typée |
| | **Alembic** | migrations de base de données |
| | **pytest** + `TestClient` | tests |
| | **Ruff** | lint + format |
| | **uv** | gestion des paquets Python |
| **Infra** | **PostgreSQL 17** | base de données |
| | **Docker Compose** (+ override dev) · **nginx** | orchestration + reverse-proxy |
| **Qualité** | **CI** GitHub Actions · **pre-commit** · `.editorconfig` · `.gitattributes` | automatisation |

---

## 📁 Structure du projet

```
config/
├── .editorconfig             # formatage cohérent entre éditeurs
├── .env / .env.example       # variables lues par Docker Compose
├── .gitattributes            # fins de ligne LF forcées (cross-OS)
├── .gitignore
├── .pre-commit-config.yaml   # vérifs avant chaque commit
├── .github/workflows/ci.yml  # lint + tests + build (GitHub Actions)
├── docker-compose.yml            # PROD : db + backend (uvicorn) + frontend (nginx)
├── docker-compose.override.yml   # DEV  : hot-reload (auto-fusionné)
│
├── backend/
│   ├── app/
│   │   ├── main.py           # point d'entrée FastAPI (assemblage)
│   │   ├── api/
│   │   │   ├── deps.py       # dépendances injectables (session DB…)
│   │   │   └── routes/
│   │   │       ├── health.py # GET /api/health
│   │   │       └── items.py  # POST/GET /api/items
│   │   ├── core/
│   │   │   ├── config.py     # Settings (env typées)
│   │   │   └── security.py   # (auth — à venir)
│   │   ├── crud/item.py      # accès aux données (Create/Read…)
│   │   ├── db/session.py     # moteur + session Postgres
│   │   ├── models/item.py    # table SQLModel
│   │   ├── schemas/item.py   # formes d'entrée/sortie de l'API
│   │   └── utils/
│   ├── alembic/
│   │   ├── env.py            # config d'exécution Alembic (réutilise Settings + modèles)
│   │   ├── script.py.mako    # gabarit des fichiers de migration
│   │   └── versions/
│   │       └── 293d51c9a311_create_item_table.py   # 1ʳᵉ migration (committée)
│   ├── alembic.ini
│   ├── tests/
│   │   ├── conftest.py       # fixtures pytest (DB en mémoire + TestClient)
│   │   ├── test_health.py
│   │   └── test_items.py
│   ├── .env / .env.example   # config backend en local (hors Docker)
│   ├── .dockerignore
│   ├── Dockerfile            # uv → uvicorn
│   ├── entrypoint.sh         # migrations puis démarrage
│   ├── pyproject.toml        # deps (uv) + config pytest + ruff
│   └── uv.lock
│
└── frontend/
    ├── src/
    │   ├── main.tsx          # providers (Mantine, Query, Router)
    │   ├── App.tsx           # aiguilleur des routes
    │   ├── index.css         # Tailwind
    │   ├── api/{axiosInstance.ts, items.ts}   # client HTTP + appels /api
    │   ├── hooks/useItems.ts                  # hooks React Query
    │   ├── schemas/item.ts                    # schémas zod + types
    │   ├── pages/Home.tsx                      # la page « Hello » + formulaire
    │   ├── routes/index.tsx                    # config des routes
    │   ├── components/  ·  layouts/            # (réutilisables / layouts)
    ├── public/favicon.svg
    ├── .env / .env.example       # variables Vite (VITE_*)
    ├── .dockerignore
    ├── Dockerfile                # build Bun → nginx
    ├── nginx.conf                # SPA + proxy /api
    ├── index.html
    ├── package.json / bun.lock
    ├── vite.config.ts
    └── tsconfig*.json
```

---

## ⚡ Démarrage rapide

**Prérequis :** [Docker](https://www.docker.com/) uniquement.

```bash
cp .env.example .env        # crée le .env racine
docker compose up --build   # DEV : hot-reload front + back (via l'override)
```

| Service | URL |
|---|---|
| 🖥️ Frontend | http://localhost:5173 |
| 🔌 API (Swagger) | http://localhost:8000/docs |

Ajoute un nom dans le formulaire → il persiste en base. Les tables sont créées automatiquement par la migration Alembic au démarrage (`entrypoint.sh`).

**DEV vs PROD** (voir [Docker](#-docker--fichier-par-fichier)) :
```bash
docker compose up                          # DEV  (override auto : uvicorn --reload + Vite)
docker compose -f docker-compose.yml up    # PROD (nginx + uvicorn, override ignoré)
docker compose down -v                     # tout arrêter + effacer la base
```

---

## 🔧 Développement en local (sans Docker)

**Backend** (Postgres requis — voir l'astuce plus bas) :
```bash
cd backend
uv sync                                   # crée .venv + installe les deps
uv run alembic upgrade head               # applique les migrations
uv run uvicorn app.main:app --reload      # → http://localhost:8000
```

**Frontend** :
```bash
cd frontend
bun install
bun run dev                               # → http://localhost:5173
```

> 💡 **Postgres jetable** (colle au `.env` par défaut) :
> ```bash
> docker run --name pg -e POSTGRES_USER=app -e POSTGRES_PASSWORD=changeme \
>   -e POSTGRES_DB=app -p 5432:5432 -d postgres:17
> ```

---

## 🐍 Backend — fichier par fichier

> Les commentaires ci-dessous sont là pour **la compréhension** ; ton code réel n'a que le strict essentiel.

### `pyproject.toml`
```toml
[project]
name = "backend"
version = "0.1.0"
requires-python = ">=3.13"          # uv can install this Python version for you
dependencies = [
    "fastapi>=0.115",               # web framework (ASGI) — replaces Flask
    "uvicorn[standard]>=0.34",      # ASGI server that runs the app
    "sqlmodel>=0.0.22",             # ORM = SQLAlchemy + Pydantic in one
    "psycopg[binary]>=3.2",         # PostgreSQL driver (precompiled)
    "pydantic-settings>=2.7",       # typed config from env vars / .env
    "alembic>=1.14",                # database migrations
]

[dependency-groups]
dev = [                             # local dev only — excluded from the prod image
    "pytest>=8",                    # test runner
    "httpx>=0.28",                  # HTTP client used by FastAPI's TestClient
    "ruff>=0.9",                    # linter + formatter
]

[tool.uv]
package = false                     # this is an app, not a library → don't build it

[tool.pytest.ini_options]
pythonpath = ["."]                  # make the `app` package importable when running pytest

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
# E=pycodestyle, F=pyflakes, I=import sorting, UP=pyupgrade, B=bugbear
select = ["E", "F", "I", "UP", "B"]
```

### `app/core/config.py`
```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load from .env; ignore unknown keys (the shared root .env has extra ones)
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres URL. In Docker this is overridden by an env var (host becomes "db")
    DATABASE_URL: str = "postgresql+psycopg://app:changeme@localhost:5432/app"

    # Frontend origins allowed by CORS. When set via env, parsed as JSON (list[str])
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


settings = Settings()  # single instance imported everywhere
```

### `app/db/session.py`
```python
from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# The engine = connection pool to Postgres, created once. echo=True logs SQL (dev only)
engine = create_engine(settings.DATABASE_URL, echo=True)


# FastAPI dependency: opens a session per request, and closes it after the response
def get_session() -> Generator[Session]:
    with Session(engine) as session:
        yield session
```

### `app/models/item.py`
```python
from sqlmodel import Field, SQLModel


# table=True → this class maps to a REAL database table
class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)  # None before insert; the DB assigns it
    name: str                                               # NOT NULL text column
```

### `app/schemas/item.py`
```python
from sqlmodel import SQLModel


# No table=True → these are pure validation/serialization schemas, not tables

class ItemCreate(SQLModel):   # what the client sends to create an item (no id)
    name: str


class ItemRead(SQLModel):     # what the API returns (id guaranteed present)
    id: int
    name: str
```

### `app/crud/item.py`
```python
from sqlmodel import Session, select

from app.models.item import Item
from app.schemas.item import ItemCreate


# Insert a new row, then return it with its DB-generated id
def create_item(session: Session, item_in: ItemCreate) -> Item:
    item = Item(name=item_in.name)
    session.add(item)      # stage the INSERT
    session.commit()       # write it to Postgres
    session.refresh(item)  # reload so item.id is populated
    return item


# SELECT * FROM item
def get_items(session: Session) -> list[Item]:
    statement = select(Item)
    return list(session.exec(statement).all())
```

### `app/api/deps.py`
```python
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.db.session import get_session

# Reusable alias → write `session: SessionDep` in routes instead of Depends(get_session)
SessionDep = Annotated[Session, Depends(get_session)]
```

### `app/api/routes/health.py`
```python
from fastapi import APIRouter

router = APIRouter()


# GET /api/health → simple liveness check
@router.get("/health")
def health() -> dict[str, str]:
    return {"message": "Hello World"}
```

### `app/api/routes/items.py`
```python
from fastapi import APIRouter

from app.api.deps import SessionDep
from app.crud.item import create_item, get_items
from app.schemas.item import ItemCreate, ItemRead

router = APIRouter()


# response_model=ItemRead → FastAPI converts the returned Item into the public schema
@router.post("/items", response_model=ItemRead)
def add_item(item_in: ItemCreate, session: SessionDep) -> ItemRead:
    # item_in = the JSON body, auto-validated against ItemCreate (422 on error)
    return create_item(session, item_in)


@router.get("/items", response_model=list[ItemRead])
def list_items(session: SessionDep) -> list[ItemRead]:
    return get_items(session)
```

### `app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, items
from app.core.config import settings

# No create_all here — the schema is owned by Alembic migrations now
app = FastAPI(title="API")

# Allow the frontend (different origin/port) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount every router under /api → /api/health, /api/items
app.include_router(health.router, prefix="/api")
app.include_router(items.router, prefix="/api")
```

### `backend/entrypoint.sh`
```sh
#!/bin/sh
set -e                               # stop on the first error

# Apply DB migrations before the server starts (Alembic owns the schema)
alembic upgrade head

exec "$@"                            # run the CMD (uvicorn ...). exec = clean signal handling
```

---

## 🎨 Frontend — fichier par fichier

### `src/index.css`
```css
/* Tailwind v4 — the Vite plugin is already registered in vite.config.ts */
@import "tailwindcss";
```

### `src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@mantine/core/styles.css'   // Mantine styles (required)
import './index.css'                // Tailwind
import App from './App.tsx'

const queryClient = new QueryClient()   // React Query cache instance

// Providers wrap the whole app: theme (Mantine) → data (Query) → routing (Router)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
)
```

### `src/api/axiosInstance.ts`
```ts
import axios from 'axios'

// One configured HTTP client, reused everywhere
const axiosInstance = axios.create({
  // Dev: hit FastAPI directly on :8000. Prod: baked to "/api" (nginx proxy) at build time
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },  // FastAPI reads JSON bodies
  withCredentials: true,                            // send cookies/auth across origins
})

export default axiosInstance
```

### `src/schemas/item.ts`
```ts
import { z } from 'zod'

// Runtime validators that mirror the backend schemas
export const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const itemCreateSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),   // also drives the form validation
})

// TS types derived from the schemas → declared once, no duplication
export type Item = z.infer<typeof itemSchema>
export type ItemCreate = z.infer<typeof itemCreateSchema>
```

### `src/api/items.ts`
```ts
import { z } from 'zod'

import axiosInstance from './axiosInstance'
import { itemSchema, type Item, type ItemCreate } from '../schemas/item'

// GET /api/items → validated array of items
export async function getItems(): Promise<Item[]> {
  const response = await axiosInstance.get('/items')
  return z.array(itemSchema).parse(response.data)   // runtime-check the response
}

// POST /api/items → the created item
export async function createItem(data: ItemCreate): Promise<Item> {
  const response = await axiosInstance.post('/items', data)
  return itemSchema.parse(response.data)
}
```

### `src/hooks/useItems.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getItems, createItem } from '../api/items'

// Read hook: gives { data, isLoading, isError, ... } + caching for free
export function useItems() {
  return useQuery({
    queryKey: ['items'],   // cache key
    queryFn: getItems,
  })
}

// Write hook: create an item, then refresh the list automatically
export function useCreateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      // Mark ['items'] stale → React Query refetches the list
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
```

### `src/App.tsx`
```tsx
import { useRoutes } from 'react-router-dom'

import routes from './routes'

// Renders the component matching the current URL
export default function App() {
  const element = useRoutes(routes)
  return <>{element}</>
}
```

### `src/routes/index.tsx`
```tsx
import type { RouteObject } from 'react-router-dom'

import Home from '../pages/Home'

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '*', element: <div className="p-8">404 — Not Found</div> },   // catch-all
]

export default routes
```

### `src/pages/Home.tsx`
```tsx
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Container, Title, TextInput, Button, Stack, Card, Text, Group } from '@mantine/core'

import { itemCreateSchema, type ItemCreate } from '../schemas/item'
import { useItems, useCreateItem } from '../hooks/useItems'

export default function Home() {
  const { data: items, isLoading, isError } = useItems()   // the list + states
  const createItem = useCreateItem()                       // the mutation

  // Form validated by the SAME zod schema as the API
  const form = useForm<ItemCreate>({
    initialValues: { name: '' },
    validate: zodResolver(itemCreateSchema),
  })

  // Validates first, then POSTs and clears the field on success
  const handleSubmit = form.onSubmit((values) => {
    createItem.mutate(values, {
      onSuccess: () => form.reset(),
    })
  })

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">Hello World 👋</Title>

      <form onSubmit={handleSubmit}>
        <Group align="flex-end">
          <TextInput
            label="Nom"
            placeholder="Entre un nom"
            style={{ flex: 1 }}
            // getInputProps wires value + onChange + error to the form state
            {...form.getInputProps('name')}
          />
          <Button type="submit" loading={createItem.isPending}>
            Ajouter
          </Button>
        </Group>
      </form>

      <Stack mt="xl">
        {isLoading && <Text>Chargement…</Text>}
        {isError && <Text c="red">Erreur de chargement</Text>}
        {items?.map((item) => (
          <Card key={item.id} withBorder padding="md">
            <Text>{item.name}</Text>
          </Card>
        ))}
        {items?.length === 0 && <Text c="dimmed">Aucun item pour l'instant.</Text>}
      </Stack>
    </Container>
  )
}
```

### `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),        // React fast-refresh
    tailwindcss(),  // Tailwind v4 (no separate config file needed)
  ],
})
```

> Les autres fichiers front (`package.json`, `tsconfig*.json`, `.oxlintrc.json`, `index.html`) sont le **scaffolding standard** de `bun create vite` — inchangés.

---

## 🐳 Docker — fichier par fichier

**Deux fichiers, deux modes.** Compose **fusionne** automatiquement l'override quand tu tapes `docker compose up` :
- `docker compose up` → **DEV** (hot-reload).
- `docker compose -f docker-compose.yml up` → **PROD** (override ignoré).

### `backend/Dockerfile`
```dockerfile
FROM python:3.13-slim

# Grab the uv binary from its official image (no pip install needed)
COPY --from=ghcr.io/astral-sh/uv:0.11.26 /uv /uvx /bin/

WORKDIR /app

# Install deps first → this layer stays cached until the lockfiles change
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev        # --frozen = exact lockfile, --no-dev = skip test/lint deps

# Then the app code
COPY . .
RUN chmod +x entrypoint.sh

ENV PATH="/app/.venv/bin:$PATH"      # put uv's venv on PATH so "uvicorn"/"alembic" resolve

ENTRYPOINT ["/app/entrypoint.sh"]                                       # always runs (migrations)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]  # default (overridable)
```

### `frontend/Dockerfile`
```dockerfile
# ─── Stage 1: build the static files with Bun ───
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ARG VITE_API_URL                    # passed by docker-compose (build-time value)
ENV VITE_API_URL=$VITE_API_URL      # Vite bakes VITE_* vars at build time
RUN bun run build                   # outputs /app/dist

# ─── Stage 2: serve the build with nginx ───
FROM nginx:alpine AS prod

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html   # only the build lands in the final image
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `frontend/nginx.conf`
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback: unknown paths return index.html so React Router can handle them
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Forward /api/* to the backend service (no trailing slash → keeps the /api prefix)
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### `docker-compose.yml` (PROD)
```yaml
services:
  db:
    image: postgres:17
    environment:                       # Postgres reads these on first boot to create db + user
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data   # persist DB data across restarts
    healthcheck:                                  # the backend waits until this passes
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy   # start only once Postgres is ready
    environment:
      # Host is "db" (the service name) inside Docker, not localhost
      DATABASE_URL: postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      CORS_ORIGINS: '["http://localhost:5173"]'   # JSON string → parsed into list[str]
    ports:
      - "${BACKEND_PORT:-8000}:8000"

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: /api           # prod build → same-origin /api (nginx proxies it)
    depends_on:
      - backend
    ports:
      - "${FRONTEND_PORT:-5173}:80"

volumes:
  postgres_data:
```

### `docker-compose.override.yml` (DEV — auto-merged)
```yaml
services:
  backend:
    volumes:
      - ./backend:/app        # mount the source for live editing
      - /app/.venv            # keep the image's venv (the bind mount would otherwise hide it)
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      target: build           # use the Bun stage (source + deps), not the nginx one
    command: bun run dev --host
    environment:
      CHOKIDAR_USEPOLLING: "true"   # reliable file-watching in Docker on Windows
    volumes:
      - ./frontend:/app
      - /app/node_modules     # keep the image's node_modules
    ports: !override          # !override REPLACES the base 5173:80 mapping (not append)
      - "5173:5173"           # Vite dev server
```

> `.dockerignore` (dans `backend/` et `frontend/`) excluent `.venv` / `node_modules` / `dist` / `.env` du contexte de build.

---

## 🔐 Variables d'environnement

Trois `.env`, **trois lecteurs différents**. Les vrais `.env` sont **gitignorés** ; committe les `.env.example`.

| Fichier | Lu par | Contenu | Secret ? |
|---|---|---|---|
| `.env` (racine) | Docker Compose | Postgres + ports | 🔒 oui |
| `backend/.env` | Pydantic Settings (hors Docker) | `DATABASE_URL`, CORS | 🔒 oui |
| `frontend/.env` | Vite (au build/dev) | `VITE_*` uniquement | ⚠️ **public** |

### `.env` (racine)
```dotenv
POSTGRES_USER=app
POSTGRES_PASSWORD=changeme
POSTGRES_DB=app

DB_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

### `backend/.env`
```dotenv
DATABASE_URL=postgresql+psycopg://app:changeme@localhost:5432/app   # local: host = localhost
CORS_ORIGINS=["http://localhost:5173"]                             # JSON (list[str])
```

### `frontend/.env`
```dotenv
VITE_API_URL=http://localhost:8000/api   # dev: call the backend directly (CORS)
```

> **Rappel** : `DATABASE_URL` vaut `@localhost` en local et `@db` en Docker. `VITE_API_URL` vaut l'URL complète en dev et `/api` en prod (build arg → proxy nginx).

---

## 🧬 Migrations (Alembic)

Alembic = **« Git pour ton schéma »** : des migrations **versionnées et committées**, rejouées partout via `alembic upgrade head` (l'`entrypoint.sh` le fait au démarrage). Une 1ʳᵉ migration est déjà présente (`alembic/versions/`).

### `backend/alembic/env.py`
```python
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

from alembic import context
from app.core.config import settings
from app.models.item import Item  # noqa: F401 — importing registers the table on SQLModel.metadata

config = context.config

# Reuse our app's DATABASE_URL instead of hardcoding it in alembic.ini
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)   # set up logging

# The "source of truth" schema Alembic diffs against the DB for autogenerate
target_metadata = SQLModel.metadata

# ... run_migrations_online/offline (standard boilerplate)
```
> 🔑 **À retenir** : chaque **nouveau modèle** doit être importé dans `env.py` (comme `Item`), sinon Alembic génère une migration vide. Le gabarit `script.py.mako` contient un `import sqlmodel` (requis par les types de colonnes SQLModel).

### Créer une nouvelle migration
```bash
docker compose up -d db         # Postgres tournant
cd backend
uv run alembic revision --autogenerate -m "your message"   # génère → COMMIT le fichier
uv run alembic upgrade head     # applique
```

---

## 🧪 Tests

Tests **isolés et rapides** : `TestClient` FastAPI + **SQLite en mémoire** injectée via un **override de dépendance** (pas de Postgres requis).

### `backend/tests/conftest.py`
```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.session import get_session
from app.main import app
from app.models.item import Item  # noqa: F401 — register the table on metadata


@pytest.fixture(name="session")
def session_fixture():
    # Fresh in-memory SQLite per test → fast and isolated, no Postgres needed
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    # Override the real DB dependency with the test session
    app.dependency_overrides[get_session] = lambda: session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()   # cleanup so tests don't leak into each other
```

### `backend/tests/test_items.py`
```python
def test_create_and_list_items(client):
    assert client.get("/api/items").json() == []                   # starts empty

    response = client.post("/api/items", json={"name": "Alice"})   # create
    assert response.status_code == 200
    created = response.json()
    assert created["name"] == "Alice"
    assert isinstance(created["id"], int)

    items = client.get("/api/items").json()                        # now listed
    assert len(items) == 1


def test_create_item_requires_name(client):
    response = client.post("/api/items", json={})   # missing "name" → validation error
    assert response.status_code == 422
```

```bash
cd backend && uv run pytest -v      # lancer les tests
```

---

## 🛠️ Qualité & outils

### `.editorconfig`
```ini
root = true

[*]
charset = utf-8
end_of_line = lf                # LF everywhere (matches .gitattributes)
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space

[*.py]
indent_size = 4

[*.{ts,tsx}]
indent_size = 4

[*.{json,yml,yaml,css,html}]
indent_size = 2
```

### `.gitattributes`
```gitattributes
# Force LF line endings for all text files (cross-OS consistency).
# Critical for entrypoint.sh: CRLF would break the shebang inside the Linux container.
* text=auto eol=lf

*.png binary
*.jpg binary
# ... other binaries

bun.lock -diff                  # hide noisy machine-generated lockfiles from diffs
uv.lock -diff
```

### Ruff (lint + format backend)
```bash
cd backend
uv run ruff check .        # lint
uv run ruff check --fix .  # lint + auto-fix (incl. import sorting)
uv run ruff format .       # format (like black)
```

---

## 🤖 CI & pre-commit

### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
      - run: uv sync
      - run: uv run ruff check .          # lint
      - run: uv run ruff format --check . # format check
      - run: uv run pytest                # tests (in-memory SQLite, no Postgres needed)

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint                 # oxlint
      - run: bun run build                # tsc typecheck + vite build
```

### `.pre-commit-config.yaml`
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.9.0
    hooks:
      - id: ruff             # lint (auto-fix)
        args: [--fix]
      - id: ruff-format      # format

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
        args: [--unsafe]     # allow Docker Compose custom tags (!override)
      - id: check-added-large-files
```

**Installation (une fois) :**
```bash
uv tool install pre-commit
pre-commit install             # branche le hook git (nécessite un repo git existant)
pre-commit run --all-files
```

Trois filets de sécurité, à des moments différents : **édition** (`.editorconfig`) → **commit** (`pre-commit`) → **push** (CI).

---

## 🔄 Le flux de données (résumé)

```
[ Home.tsx ]
    │  useItems() / useCreateItem()          (React Query)
    ▼
[ hooks/useItems.ts ] ──► [ api/items.ts ] ──► [ axiosInstance ] ──► HTTP
    │  invalidate on success                          │ zod .parse (runtime types)
    ▼                                                 ▼
la liste se rafraîchit                        FastAPI  /api/items
                                                      │
                              route ──► crud ──► SQLModel ──► PostgreSQL
                              (schemas ItemCreate/ItemRead · schéma géré par Alembic)
```

---

## 🗺️ Prochaines étapes

- [x] **Alembic** — migrations câblées (remplace `create_all`)
- [x] **Tests** — health + items (`TestClient` + SQLite en mémoire)
- [x] **Mode dev Docker** — hot-reload front + back (override)
- [x] **Qualité** — Ruff, CI GitHub Actions, pre-commit, editorconfig, gitattributes
- [ ] **Auth** (JWT) → `core/security.py`, `models/user.py`, `routes/auth.py`, `deps.get_current_user`
- [ ] **3D optionnelle** → `react-three-fiber` par projet (hors socle)

---

## 🚀 Rappel des commandes

```bash
# Docker
docker compose up --build                              # DEV (hot-reload)
docker compose -f docker-compose.yml up --build        # PROD
docker compose down -v                                 # stop + wipe DB

# Backend (local)
cd backend && uv run uvicorn app.main:app --reload     # serveur
cd backend && uv run pytest -v                         # tests
cd backend && uv run ruff check --fix . && uv run ruff format .   # lint + format
cd backend && uv run alembic revision --autogenerate -m "msg"     # migration
cd backend && uv run alembic upgrade head              # appliquer

# Frontend (local)
cd frontend && bun run dev                             # serveur
cd frontend && bun run lint                            # oxlint
```
