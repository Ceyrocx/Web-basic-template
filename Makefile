.PHONY: help up up-prod down logs dev test lint migrate migration front-dev front-lint front-build

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-14s %s\n", $$1, $$2}'

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
