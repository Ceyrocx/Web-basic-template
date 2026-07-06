FROM python:3.13-slim

# Copy the uv binary from its official image (no pip install needed)
COPY --from=ghcr.io/astral-sh/uv:0.11.26 /uv /uvx /bin/

WORKDIR /app

# Install deps first so this layer stays cached until the lockfiles change
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Then the app code
COPY . .
RUN chmod +x entrypoint.sh

# Put uv's venv on PATH so "uvicorn"/"alembic" resolve
ENV PATH="/app/.venv/bin:$PATH"

# Run as a non-root user
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
