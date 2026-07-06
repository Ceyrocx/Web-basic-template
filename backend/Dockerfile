FROM python:3.13-slim

# Récupère le binaire uv depuis l'image officielle (pas besoin de l'installer via pip)
COPY --from=ghcr.io/astral-sh/uv:0.11.26 /uv /uvx /bin/

WORKDIR /app

# 1) Dépendances d'abord (couche mise en cache tant que les lockfiles ne bougent pas)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# 2) Puis le code de l'application
COPY . .
RUN chmod +x entrypoint.sh

# Le venv créé par uv → on le met dans le PATH pour appeler "uvicorn" directement
ENV PATH="/app/.venv/bin:$PATH"

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
