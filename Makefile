.PHONY: help up up-prod down logs dev test lint typecheck migrate migration front-dev front-lint front-build

help: ## Show this help
	@echo Targets:
	@echo   make up           start the full stack in dev, hot-reload
	@echo   make up-prod      start the full stack in prod
	@echo   make down         stop everything and wipe the database
	@echo   make logs         follow container logs
	@echo   make dev          run the backend locally
	@echo   make test         run backend tests
	@echo   make lint         ruff check and format the backend
	@echo   make typecheck    pyright type-check the backend
	@echo   make migrate      apply DB migrations
	@echo   make migration    create a migration, use m=your_message
	@echo   make front-dev    run the frontend locally
	@echo   make front-lint   oxlint the frontend
	@echo   make front-build  build the frontend

# ─── Docker ────────────────────────────────────────────
up: ## Start the full stack in DEV (hot-reload)
	docker compose up --build

up-prod: ## Start the full stack in PROD
	docker compose -f docker-compose.yml up --build

down: ## Stop everything and wipe the database
	docker compose down -v

logs: ## Follow all container logs
	docker compose logs -f

# ─── Backend ───────────────────────────────────────────
dev: ## Run the backend locally (uvicorn --reload)
	cd backend && uv run uvicorn app.main:app --reload

test: ## Run the backend tests
	cd backend && uv run pytest -v

lint: ## Lint + format the backend (ruff)
	cd backend && uv run ruff check --fix . && uv run ruff format .

typecheck: ## Type-check the backend (pyright)
	cd backend && uv run pyright

migrate: ## Apply DB migrations
	cd backend && uv run alembic upgrade head

migration: ## Create a migration -> make migration m="your message"
	cd backend && uv run alembic revision --autogenerate -m "$(m)"

# ─── Frontend ──────────────────────────────────────────
front-dev: ## Run the frontend locally (Vite)
	cd frontend && bun run dev

front-lint: ## Lint the frontend (oxlint)
	cd frontend && bun run lint

front-build: ## Build the frontend
	cd frontend && bun run build
