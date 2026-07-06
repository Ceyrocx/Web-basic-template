# 🚀 Fullstack Starter — React + FastAPI + Postgres (Dockerized)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-UI-339AF0?logo=mantine&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1-000000?logo=bun&logoColor=white)
![uv](https://img.shields.io/badge/uv-Python-DE5FE9?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> Un **repo de base** à copier-coller à chaque nouveau projet. Objectif : un fullstack **typé de bout en bout**, migré, **testé des deux côtés**, linté, dockerisé (dev **+** prod), avec CI/pre-commit — prêt à lancer en une commande, et assez commenté pour comprendre **à quoi sert chaque fichier**.

Petite app de démo incluse : une page **« Hello World »** + un **formulaire** qui ajoute un item en base et affiche la liste.

---

## 🧱 La stack

| Couche | Techno | Rôle |
|---|---|---|
| **Frontend** | Bun · React 19 · Vite 8 · TypeScript | base du front |
| | **Mantine** · **Tailwind v4** | composants UI + utilitaires |
| | **TanStack Query** · **React Router** · **Zod** | données · routing · validation |
| | **oxlint** · **Vitest** + Testing Library | lint · tests |
| **Backend** | **FastAPI** · **SQLModel** · **Pydantic Settings** | API · ORM · config typée |
| | **Alembic** · **pytest** · **Ruff** · **uv** | migrations · tests · lint · paquets |
| **Infra** | **PostgreSQL 17** · **Docker Compose** (dev+prod) · **nginx** | DB · orchestration · reverse-proxy |
| **Qualité** | **CI** · **pre-commit** · **Dependabot** · `Makefile` · `.editorconfig` · `.gitattributes` | automatisation |

---

## 📁 Structure du projet

```
config/
├── Makefile                  # raccourcis : make up / test / lint / migrate…
├── LICENSE                   # MIT
├── .editorconfig  .gitattributes  .gitignore
├── .env / .env.example       # variables lues par Docker Compose
├── .pre-commit-config.yaml   # vérifs avant chaque commit
├── .github/
│   ├── workflows/ci.yml      # lint + tests + build (GitHub Actions)
│   └── dependabot.yml        # màj auto des deps (actions, docker, python)
├── docker-compose.yml            # PROD : db + backend (uvicorn) + frontend (nginx)
├── docker-compose.override.yml   # DEV  : hot-reload (auto-fusionné)
│
├── backend/
│   ├── app/
│   │   ├── main.py           # point d'entrée FastAPI
│   │   ├── api/{deps.py, routes/{health.py, items.py}}
│   │   ├── core/{config.py, security.py}
│   │   ├── crud/item.py  ·  db/session.py
│   │   ├── models/item.py  ·  schemas/item.py
│   │   └── utils/
│   ├── alembic/{env.py, script.py.mako, versions/…create_item_table.py}
│   ├── alembic.ini
│   ├── tests/{conftest.py, test_health.py, test_items.py}
│   ├── .env / .env.example  ·  .dockerignore
│   ├── Dockerfile            # uv → uvicorn (non-root)
│   ├── entrypoint.sh         # migrations puis démarrage
│   └── pyproject.toml        # deps (uv) + pytest + ruff
│
└── frontend/
    ├── src/
    │   ├── main.tsx  ·  App.tsx  ·  index.css
    │   ├── api/{axiosInstance.ts, items.ts}
    │   ├── hooks/useItems.ts  ·  schemas/item.ts
    │   ├── pages/{Home.tsx, Home.test.tsx}
    │   ├── routes/index.tsx  ·  components/  ·  layouts/
    │   ├── setupTests.ts  ·  test-utils.tsx
    ├── public/favicon.svg
    ├── .env / .env.example  ·  .dockerignore
    ├── Dockerfile            # build Bun → nginx
    ├── nginx.conf            # SPA + proxy /api + security headers
    ├── vite.config.ts        # Vite + config Vitest
    └── package.json  ·  bun.lock  ·  tsconfig*.json
```

---

## ⚡ Démarrage rapide

**Prérequis :** [Docker](https://www.docker.com/) (et `make`, optionnel mais pratique).

```bash
cp .env.example .env
make up            # = docker compose up --build (DEV, hot-reload)
```

| Service | URL |
|---|---|
| 🖥️ Frontend | http://localhost:5173 |
| 🔌 API (Swagger) | http://localhost:8000/docs |

Les tables sont créées automatiquement par la migration Alembic au démarrage.

**DEV vs PROD** (grâce à l'override auto-fusionné) :
```bash
make up            # DEV  : uvicorn --reload + Vite (hot-reload)
make up-prod       # PROD : nginx + uvicorn (override ignoré)
make down          # stop + efface la base
```

---

## 🔧 Développement en local (sans Docker)

```bash
# Backend (Postgres requis — voir l'astuce plus bas)
cd backend && uv sync && uv run alembic upgrade head
uv run uvicorn app.main:app --reload      # → http://localhost:8000

# Frontend
cd frontend && bun install && bun run dev  # → http://localhost:5173
```

> 💡 **Postgres jetable** (colle au `.env` par défaut) :
> ```bash
> docker run --name pg -e POSTGRES_USER=app -e POSTGRES_PASSWORD=changeme \
>   -e POSTGRES_DB=app -p 5432:5432 -d postgres:17
> ```

---

## 🐍 Backend — fichier par fichier

> Commentaires **pédagogiques** ci-dessous ; ton code réel n'a que l'essentiel.

### `app/core/config.py`
```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load from .env; ignore unknown keys (the shared root .env has extra ones)
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # In Docker this is overridden by an env var (host becomes "db")
    DATABASE_URL: str = "postgresql+psycopg://app:changeme@localhost:5432/app"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]   # parsed as JSON when set via env


settings = Settings()  # single instance imported everywhere
```

### `app/db/session.py`
```python
from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# Connection pool to Postgres, created once. echo=True logs SQL (dev only)
engine = create_engine(settings.DATABASE_URL, echo=True)


# FastAPI dependency: one session per request, closed after the response
def get_session() -> Generator[Session]:
    with Session(engine) as session:
        yield session
```

### `app/models/item.py`  ·  `app/schemas/item.py`
```python
# models/item.py — the DB table
from sqlmodel import Field, SQLModel


class Item(SQLModel, table=True):                           # table=True → real table
    id: int | None = Field(default=None, primary_key=True)  # None until the DB assigns it
    name: str
```
```python
# schemas/item.py — API input/output shapes (no table=True)
from sqlmodel import SQLModel


class ItemCreate(SQLModel):   # request body (no id)
    name: str


class ItemRead(SQLModel):     # response (id guaranteed present)
    id: int
    name: str
```

### `app/crud/item.py`
```python
from sqlmodel import Session, select

from app.models.item import Item
from app.schemas.item import ItemCreate


def create_item(session: Session, item_in: ItemCreate) -> Item:
    item = Item(name=item_in.name)
    session.add(item)
    session.commit()
    session.refresh(item)  # reload so item.id is populated
    return item


def get_items(session: Session) -> list[Item]:
    return list(session.exec(select(Item)).all())
```

### `app/api/deps.py`  ·  `app/api/routes/*`
```python
# deps.py — reusable "inject a DB session" annotation
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session
from app.db.session import get_session

SessionDep = Annotated[Session, Depends(get_session)]
```
```python
# routes/health.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/health")                      # GET /api/health
def health() -> dict[str, str]:
    return {"message": "Hello World"}
```
```python
# routes/items.py
from fastapi import APIRouter
from app.api.deps import SessionDep
from app.crud.item import create_item, get_items
from app.schemas.item import ItemCreate, ItemRead

router = APIRouter()

@router.post("/items", response_model=ItemRead)   # response_model → public schema
def add_item(item_in: ItemCreate, session: SessionDep) -> ItemRead:
    return create_item(session, item_in)           # item_in = JSON body, auto-validated

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

# No create_all here — the schema is owned by Alembic migrations
app = FastAPI(title="API")

app.add_middleware(                       # let the frontend (other origin) call the API
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")   # /api/health, /api/items
app.include_router(items.router, prefix="/api")
```

### `backend/entrypoint.sh`
```sh
#!/bin/sh
set -e
alembic upgrade head   # apply DB migrations before the server starts
exec "$@"              # then run the CMD (uvicorn ...)
```

---

## 🎨 Frontend — fichier par fichier

### `src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'

// Sensible React Query defaults for the whole app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,            // data stays "fresh" for 30s → fewer refetches
      retry: 1,                     // retry a failed query once (default is 3)
      refetchOnWindowFocus: false,  // don't refetch every time the tab regains focus
    },
  },
})

// Providers: Mantine (theme) → React Query (data cache) → Router (navigation)
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

### `src/api/axiosInstance.ts`  ·  `src/schemas/item.ts`  ·  `src/api/items.ts`
```ts
// axiosInstance.ts — one configured HTTP client
import axios from 'axios'
export default axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',  // /api in prod (nginx)
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
```
```ts
// schemas/item.ts — zod validators that mirror the backend schemas
import { z } from 'zod'
export const itemSchema = z.object({ id: z.number(), name: z.string() })
export const itemCreateSchema = z.object({ name: z.string().min(1, 'Le nom est requis') })
export type Item = z.infer<typeof itemSchema>          // types derived from schemas
export type ItemCreate = z.infer<typeof itemCreateSchema>
```
```ts
// api/items.ts — endpoint functions, validated at runtime
import { z } from 'zod'
import axiosInstance from './axiosInstance'
import { itemSchema, type Item, type ItemCreate } from '../schemas/item'

export async function getItems(): Promise<Item[]> {
  const res = await axiosInstance.get('/items')
  return z.array(itemSchema).parse(res.data)           // runtime-check the response
}
export async function createItem(data: ItemCreate): Promise<Item> {
  const res = await axiosInstance.post('/items', data)
  return itemSchema.parse(res.data)
}
```

### `src/hooks/useItems.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getItems, createItem } from '../api/items'

export function useItems() {                            // read: { data, isLoading, isError }
  return useQuery({ queryKey: ['items'], queryFn: getItems })
}

export function useCreateItem() {                       // write: create then refresh the list
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}
```

### `src/pages/Home.tsx`
```tsx
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Container, Title, TextInput, Button, Stack, Card, Text, Group } from '@mantine/core'

import { itemCreateSchema, type ItemCreate } from '../schemas/item'
import { useItems, useCreateItem } from '../hooks/useItems'

export default function Home() {
  const { data: items, isLoading, isError } = useItems()
  const createItem = useCreateItem()

  const form = useForm<ItemCreate>({
    initialValues: { name: '' },
    validate: zodResolver(itemCreateSchema),   // same schema as the API
  })

  const handleSubmit = form.onSubmit((values) => {
    createItem.mutate(values, { onSuccess: () => form.reset() })
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
            {...form.getInputProps('name')}    // wires value + onChange + error
          />
          <Button type="submit" loading={createItem.isPending}>Ajouter</Button>
        </Group>
      </form>

      <Stack mt="xl">
        {isLoading && <Text>Chargement…</Text>}
        {isError && <Text c="red">Erreur de chargement</Text>}
        {items?.map((item) => (
          <Card key={item.id} withBorder padding="md"><Text>{item.name}</Text></Card>
        ))}
        {items?.length === 0 && <Text c="dimmed">Aucun item pour l'instant.</Text>}
      </Stack>
    </Container>
  )
}
```

> `App.tsx` (routeur) et `routes/index.tsx` (config des routes) sont inchangés ; `package.json`/`tsconfig*` = scaffolding Bun+Vite.

---

## 🐳 Docker — fichier par fichier

**Deux fichiers, deux modes.** `docker compose up` **fusionne** l'override (DEV) ; `docker compose -f docker-compose.yml up` = PROD.

### `backend/Dockerfile`
```dockerfile
FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.11.26 /uv /uvx /bin/   # grab the uv binary

WORKDIR /app

COPY pyproject.toml uv.lock ./          # deps first → layer cached until lockfiles change
RUN uv sync --frozen --no-dev

COPY . .
RUN chmod +x entrypoint.sh

ENV PATH="/app/.venv/bin:$PATH"         # so "uvicorn"/"alembic" resolve

# Run as a non-root user (security best practice)
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `frontend/Dockerfile`
```dockerfile
# Stage 1: build the static files with Bun
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG VITE_API_URL                        # passed by docker-compose (build-time)
ENV VITE_API_URL=$VITE_API_URL          # Vite bakes VITE_* at build
RUN bun run build

# Stage 2: serve with nginx (only the build lands in the final image)
FROM nginx:alpine AS prod
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
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

    # Security headers (sent on every response, incl. errors)
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location / {                              # SPA fallback → index.html
        try_files $uri $uri/ /index.html;
    }
    location /api/ {                          # proxy to backend (keeps the /api prefix)
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### `docker-compose.yml` (PROD) — avec healthchecks
```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports: ["${DB_PORT:-5432}:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]      # persist data
    healthcheck:                                            # backend waits on this
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      db: { condition: service_healthy }                   # start once Postgres is ready
    environment:
      DATABASE_URL: postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      CORS_ORIGINS: '["http://localhost:5173"]'            # JSON → list[str]
    ports: ["${BACKEND_PORT:-8000}:8000"]
    healthcheck:                                           # uses python (no curl needed)
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s                                    # grace period for boot + migrations

  frontend:
    build:
      context: ./frontend
      args: { VITE_API_URL: /api }                         # same-origin /api (nginx proxies)
    depends_on:
      backend: { condition: service_healthy }              # wait until the API is healthy
    ports: ["${FRONTEND_PORT:-5173}:80"]
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/"]
      interval: 10s
      timeout: 5s
      retries: 3

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
    build: { target: build }  # use the Bun stage, not nginx
    command: bun run dev --host
    environment: { CHOKIDAR_USEPOLLING: "true" }   # reliable file-watching on Windows
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports: !override          # !override REPLACES the base 5173:80 (not append)
      - "5173:5173"
    healthcheck: { disable: true }   # dev runs Vite on 5173, not nginx on 80
```

---

## 🔐 Variables d'environnement

Trois `.env`, **trois lecteurs**. Vrais `.env` gitignorés ; committe les `.env.example`.

| Fichier | Lu par | Contenu | Secret ? |
|---|---|---|---|
| `.env` (racine) | Docker Compose | Postgres + ports | 🔒 |
| `backend/.env` | Pydantic Settings (hors Docker) | `DATABASE_URL`, CORS | 🔒 |
| `frontend/.env` | Vite | `VITE_*` uniquement | ⚠️ public |

```dotenv
# .env (racine)
POSTGRES_USER=app
POSTGRES_PASSWORD=changeme
POSTGRES_DB=app
DB_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
```
```dotenv
# backend/.env  → DATABASE_URL=postgresql+psycopg://app:changeme@localhost:5432/app  (localhost!)
# frontend/.env → VITE_API_URL=http://localhost:8000/api  (dev; "/api" in the prod build)
```

> `DATABASE_URL` vaut `@localhost` en local et `@db` en Docker. `VITE_API_URL` : URL complète en dev, `/api` en prod.

---

## 🧬 Migrations (Alembic)

« Git pour ton schéma » : migrations **versionnées et committées**, rejouées via `alembic upgrade head` (fait par l'`entrypoint.sh`). Une 1ʳᵉ migration est déjà présente.

```bash
make migrate                              # apply migrations
make migration m="create user table"     # generate a new one (then COMMIT the file)
```
> 🔑 Chaque **nouveau modèle** doit être importé dans `alembic/env.py` (comme `Item`), sinon la migration serait vide. Le gabarit `script.py.mako` contient `import sqlmodel` (requis par les types de colonnes).

---

## 🧪 Tests

**Backend** — `TestClient` FastAPI + **SQLite en mémoire** injectée via un override de dépendance (pas de Postgres requis).
**Frontend** — **Vitest** + Testing Library, API **mockée** (le pendant front du même principe).

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
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool)      # in-memory, isolated per test
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    app.dependency_overrides[get_session] = lambda: session   # swap the real DB
    yield TestClient(app)
    app.dependency_overrides.clear()
```

### `frontend/vite.config.ts`  ·  `src/setupTests.ts`  ·  `src/test-utils.tsx`
```ts
// vite.config.ts — Vitest config (jsdom = fake DOM)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: { environment: 'jsdom', setupFiles: './src/setupTests.ts' },
})
```
```ts
// setupTests.ts — runs before each test file
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())               // unmount between tests (no auto-cleanup w/o globals)

// jsdom lacks these browser APIs that Mantine relies on — stub them
vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
}))
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
```
```tsx
// test-utils.tsx — render wrapped in the app's providers
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider><QueryClientProvider client={queryClient}>{ui}</QueryClientProvider></MantineProvider>,
  )
}
```

### `frontend/src/pages/Home.test.tsx`
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Home from './Home'
import { renderWithProviders } from '../test-utils'
import * as itemsApi from '../api/items'

vi.mock('../api/items')                  // no network in tests

describe('Home', () => {
  beforeEach(() => {
    vi.mocked(itemsApi.getItems).mockResolvedValue([])
    vi.mocked(itemsApi.createItem).mockResolvedValue({ id: 1, name: 'Alice' })
  })

  it('renders the title', () => {
    renderWithProviders(<Home />)
    expect(screen.getByText('Hello World 👋')).toBeInTheDocument()
  })

  it('submits the form with the typed name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)
    await user.type(screen.getByLabelText('Nom'), 'Alice')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    // TanStack Query passes a 2nd (context) arg to mutationFn → check the 1st arg only
    await waitFor(() => expect(itemsApi.createItem).toHaveBeenCalled())
    expect(vi.mocked(itemsApi.createItem).mock.calls[0][0]).toEqual({ name: 'Alice' })
  })
})
```

```bash
make test         # backend (pytest)
cd frontend && bun run test     # frontend (Vitest, watch)
```

---

## 🛠️ Qualité & automatisation

### `Makefile` (task runner)
```makefile
# make <target> — run `make` to list them all
up:        docker compose up --build                    # DEV
up-prod:   docker compose -f docker-compose.yml up --build
down:      docker compose down -v
test:      cd backend && uv run pytest -v
lint:      cd backend && uv run ruff check --fix . && uv run ruff format .
migrate:   cd backend && uv run alembic upgrade head
# … + migration, dev, logs, front-dev, front-lint, front-build
```
> Sur **Windows** : `scoop install make` puis lance-le depuis **Git Bash**.

### `.pre-commit-config.yaml` — Ruff depuis le venv (zéro drift)
```yaml
repos:
  - repo: local
    hooks:
      - id: ruff-check          # uses the project's ruff (uv.lock) → same version as CI
        entry: uv run --project backend ruff check --fix --force-exclude
        language: system
        types_or: [python, pyi]
        require_serial: true
      - id: ruff-format
        entry: uv run --project backend ruff format --force-exclude
        language: system
        types_or: [python, pyi]
        require_serial: true
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
        args: [--unsafe]        # allow Docker Compose custom tags (!override)
      - id: check-added-large-files
```
```bash
uv tool install pre-commit && pre-commit install   # one-time setup
```

### `.github/workflows/ci.yml`
```yaml
name: CI
on: { push: { branches: [main] }, pull_request: }
concurrency:                                       # cancel superseded runs
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  backend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: backend } }
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
        with: { enable-cache: true }               # cache uv packages
      - run: uv sync
      - run: uv run ruff check .
      - run: uv run ruff format --check .
      - run: uv run pytest
  frontend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: frontend } }
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - uses: actions/cache@v4
        with: { path: ~/.bun/install/cache, key: "bun-${{ hashFiles('frontend/bun.lock') }}" }
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run test:run                       # frontend tests
      - run: bun run build
```

### `.github/dependabot.yml`
```yaml
version: 2
updates:
  - { package-ecosystem: github-actions, directory: /, schedule: { interval: weekly } }
  - { package-ecosystem: pip, directory: /backend, schedule: { interval: weekly } }   # uv-aware
  - { package-ecosystem: docker, directory: /backend, schedule: { interval: weekly } }
  - { package-ecosystem: docker, directory: /frontend, schedule: { interval: weekly } }
```
> Le front (Bun) n'est pas couvert : Dependabot ne gère pas encore `bun.lock`. Utilise Renovate ou `bun update` si besoin.

Trois filets à des moments différents : **édition** (`.editorconfig` + `.gitattributes` LF) → **commit** (pre-commit) → **push** (CI).

---

## 🔄 Le flux de données

```
[ Home.tsx ] → useItems / useCreateItem (React Query)
   → hooks/useItems.ts → api/items.ts (zod .parse) → axios → FastAPI /api/items
   → route → crud → SQLModel → PostgreSQL   (schéma géré par Alembic)
   ↑ invalidate on success → la liste se rafraîchit
```

---

## 🗺️ Prochaines étapes

- [x] Alembic · Tests (back + **front**) · Mode dev Docker
- [x] Ruff · CI · pre-commit · Dependabot · Makefile · user non-root · healthchecks
- [ ] **Auth** (JWT) → `core/security.py`, `models/user.py`, `routes/auth.py`, `deps.get_current_user`
- [ ] **3D optionnelle** → `react-three-fiber` par projet (hors socle)

---

## 🚀 Commandes (via `make`)

```bash
make               # list all targets
make up            # DEV (hot-reload)   ·   make up-prod   ·   make down
make test          # backend tests      ·   make lint      ·   make migrate
make migration m="msg"                   # new migration
# Frontend: cd frontend && bun run dev | bun run test | bun run lint
```
