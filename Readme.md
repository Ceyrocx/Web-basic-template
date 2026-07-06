# 🚀 Fullstack Starter — React + FastAPI + Postgres (Dockerized)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-UI-339AF0?logo=mantine&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1-000000?logo=bun&logoColor=white)
![uv](https://img.shields.io/badge/uv-Python-DE5FE9?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

> Un **repo de base** à copier-coller à chaque nouveau projet. Objectif : un fullstack **typé de bout en bout**, migré + testé, prêt à lancer en une commande, et suffisamment commenté pour comprendre **à quoi sert chaque fichier**.

Petite app de démo incluse : une page **« Hello World »** + un **formulaire** qui ajoute un item en base et affiche la liste (Mantine + React Query côté front, FastAPI + SQLModel côté back).

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
| | **uv** | gestion des paquets Python |
| **Infra** | **PostgreSQL 17** | base de données |
| | **Docker Compose** + **nginx** | orchestration + reverse-proxy |

---

## 📁 Structure du projet

```
config/
├── .env                      # variables lues par Docker Compose
├── .env.example              # modèle committé
├── .gitignore
├── docker-compose.yml        # orchestre db + backend + frontend
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
│   │   └── versions/         # migrations générées (committées)
│   ├── alembic.ini
│   ├── tests/
│   │   ├── conftest.py       # fixtures pytest (DB en mémoire + TestClient)
│   │   ├── test_health.py
│   │   └── test_items.py
│   ├── .env / .env.example   # config backend en local (hors Docker)
│   ├── .dockerignore
│   ├── Dockerfile            # uv → uvicorn
│   ├── entrypoint.sh         # migrations puis démarrage
│   ├── pyproject.toml        # dépendances (uv) + config pytest
│   └── uv.lock
│
└── frontend/
    ├── src/
    │   ├── main.tsx          # providers (Mantine, Query, Router)
    │   ├── App.tsx           # aiguilleur des routes
    │   ├── index.css         # Tailwind
    │   ├── api/
    │   │   ├── axiosInstance.ts  # client HTTP configuré
    │   │   └── items.ts          # fonctions d'appel /api/items
    │   ├── hooks/useItems.ts     # hooks React Query
    │   ├── schemas/item.ts       # schémas zod + types
    │   ├── pages/Home.tsx        # la page « Hello » + formulaire
    │   ├── routes/index.tsx      # config des routes
    │   ├── components/           # (UI réutilisable)
    │   └── layouts/              # (layouts partagés)
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

## ⚡ Démarrage rapide (Docker)

**Prérequis :** [Docker](https://www.docker.com/) uniquement.

```bash
# 1) Crée le .env racine à partir du modèle
cp .env.example .env

# 2) Lance tout (db + backend + frontend)
docker compose up --build
```

| Service | URL |
|---|---|
| 🖥️ Frontend | http://localhost:5173 |
| 🔌 API (Swagger) | http://localhost:8000/docs |

> ⚠️ **Une migration Alembic doit exister** (`backend/alembic/versions/`) pour que les tables soient créées au démarrage. Voir la section **[Migrations](#-migrations-de-base-de-données-alembic)** si le dossier est vide.

Pour **repartir de zéro** (⚠️ efface la base) :
```bash
docker compose down -v
```

---

## 🔧 Développement en local (sans Docker)

**Backend** (nécessite un Postgres accessible — voir l'astuce plus bas) :
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

> 💡 **Postgres jetable** pour le dev backend (colle au `.env` par défaut) :
> ```bash
> docker run --name pg -e POSTGRES_USER=app -e POSTGRES_PASSWORD=changeme \
>   -e POSTGRES_DB=app -p 5432:5432 -d postgres:17
> ```

---

## 🐍 Backend — fichier par fichier

> Les commentaires ci-dessous sont là pour **la compréhension** : ton code réel n'a que le strict essentiel.

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
dev = [                             # installed only for local dev, excluded from the prod image
    "pytest>=8",                    # test runner
    "httpx>=0.28",                  # HTTP client used by FastAPI's TestClient
]

[tool.uv]
package = false                     # this is an app, not a library → don't try to build it

[tool.pytest.ini_options]
pythonpath = ["."]                  # make the `app` package importable when running pytest
```

### `app/core/config.py`
```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load variables from .env; ignore unknown keys (the shared root .env has extra ones)
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres URL. In Docker this is overridden by an env var (host becomes "db")
    DATABASE_URL: str = "postgresql+psycopg://app:changeme@localhost:5432/app"

    # Frontend origins allowed by CORS. When set via env, parsed as JSON (list[str])
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


settings = Settings()  # single instance imported everywhere: `from app.core.config import settings`
```

### `app/db/session.py`
```python
from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# The engine = connection pool to Postgres, created once. echo=True logs SQL (dev only)
engine = create_engine(settings.DATABASE_URL, echo=True)


# FastAPI dependency: opens a session per request, and closes it after the response
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
```

### `app/models/item.py`
```python
from sqlmodel import SQLModel, Field


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

from app.core.config import settings
from app.api.routes import health, items


# Note: no create_all here — the schema is owned by Alembic migrations now
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

> Les autres fichiers front (`package.json`, `tsconfig*.json`, `.oxlintrc.json`, `index.html`) sont le **scaffolding standard** généré par `bun create vite` — inchangés.

---

## 🐳 Docker — fichier par fichier

### `backend/Dockerfile`
```dockerfile
FROM python:3.13-slim

# Grab the uv binary from its official image (no pip install needed)
COPY --from=ghcr.io/astral-sh/uv:0.11.26 /uv /uvx /bin/

WORKDIR /app

# Install deps first → this layer stays cached until the lockfiles change
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev        # --frozen = exact lockfile, --no-dev = skip test deps

# Then the app code
COPY . .
RUN chmod +x entrypoint.sh

ENV PATH="/app/.venv/bin:$PATH"      # put uv's venv on PATH so "uvicorn"/"alembic" resolve

ENTRYPOINT ["/app/entrypoint.sh"]                                       # always runs (migrations)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]  # default (overridable)
```

### `backend/.dockerignore`
```
.venv/            # local venv is OS-specific; uv rebuilds it inside the image
__pycache__/
*.pyc
.env              # never bake secrets into the image
.pytest_cache/
.mypy_cache/
.ruff_cache/
```

### `frontend/Dockerfile`
```dockerfile
# ─── Stage 1: build the static files with Bun ───
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile   # exact lockfile install

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

### `frontend/.dockerignore`
```
node_modules/     # OS-specific; bun reinstalls it inside the image
dist/             # rebuilt in the image
.env
```

### `docker-compose.yml`
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
# Postgres
POSTGRES_USER=app
POSTGRES_PASSWORD=changeme
POSTGRES_DB=app

# Ports exposés sur ta machine
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

> **Rappel** : la même variable `DATABASE_URL` vaut `@localhost` en local et `@db` dans Docker (injectée par Compose). De même, `VITE_API_URL` vaut `http://localhost:8000/api` en dev et `/api` en prod (build arg → proxy nginx).

---

## 🧬 Migrations de base de données (Alembic)

Alembic remplace `create_all` : c'est **« Git pour ton schéma »** — des migrations **versionnées** que tu commites, et qui se rejouent partout (ton PC, la prod, le conteneur).

### `backend/alembic.ini`
```ini
[alembic]
script_location = alembic          # where migration scripts live
prepend_sys_path = .               # add backend/ to sys.path so env.py can import `app`
version_path_separator = os

# No sqlalchemy.url here → it is injected in env.py from app.core.config.settings

# ... (+ standard logging config, never edited)
```

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


def run_migrations_offline() -> None:      # emit SQL without connecting (rarely used)
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata,
                      literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:       # connect and apply (the usual mode)
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.", poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```
> 🔑 **À retenir** : chaque **nouveau modèle** doit être importé dans `env.py` (comme `Item`), sinon Alembic ne le « voit » pas et génère une migration vide.

### `backend/alembic/script.py.mako`
```mako
"""${message}
... (Alembic fills in the revision id, date, etc.)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel                    # ← required: SQLModel migrations use sqlmodel column types
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, Sequence[str], None] = ${repr(down_revision)}
# ...

def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

### Générer & appliquer une migration
```bash
docker compose down -v          # start from an empty DB (create_all may have left tables)
docker compose up -d db         # start Postgres only
cd backend
uv run alembic revision --autogenerate -m "create item table"   # generate → COMMIT the file
uv run alembic upgrade head     # apply
```

---

## 🧪 Tests

Tests **isolés et rapides** : `TestClient` FastAPI + **SQLite en mémoire** injectée à la place de Postgres via un **override de dépendance** (le pattern de test FastAPI de référence). Aucun Postgres requis.

### `backend/tests/conftest.py`
```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.db.session import get_session
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

### `backend/tests/test_health.py`
```python
def test_health(client):               # pytest injects the `client` fixture by name
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
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
    assert items[0]["name"] == "Alice"


def test_create_item_requires_name(client):
    response = client.post("/api/items", json={})   # missing "name" → validation error
    assert response.status_code == 422
```

### Lancer les tests
```bash
cd backend
uv run pytest -v
```

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
                              (schemas: ItemCreate / ItemRead pour valider + sérialiser)
                              (schéma géré par Alembic)
```

---

## 🗺️ Prochaines étapes

- [x] **Alembic** — migrations câblées (remplace `create_all`)
- [x] **Tests** — health + items (`TestClient` + SQLite en mémoire)
- [ ] **Auth** (JWT) → `core/security.py`, `models/user.py`, `routes/auth.py`, `deps.get_current_user`
- [ ] **Mode dev Docker** → volumes montés + `--reload` pour le hot-reload en conteneur

---

## 🚀 Rappel des commandes

```bash
docker compose up --build                              # tout lancer
docker compose down -v                                 # tout arrêter + effacer la base

cd backend && uv run uvicorn app.main:app --reload     # backend seul (local)
cd backend && uv run pytest -v                         # lancer les tests
cd backend && uv run alembic revision --autogenerate -m "msg"   # nouvelle migration
cd backend && uv run alembic upgrade head              # appliquer les migrations

cd frontend && bun run dev                             # frontend seul (local)
```
