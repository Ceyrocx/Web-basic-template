# 🧬 Démarrer un nouveau projet depuis ce template

Checklist pour repartir de ce socle sur un nouveau projet. Voir aussi le [Readme](Readme.md) (la stack) et [EXTENSIONS.md](EXTENSIONS.md) (auth + 3D).

---

## 🚀 1. Récupérer le template

**Recommandé — GitHub Template** *(une fois : repo Settings → coche « Template repository »)* :
- Sur le repo → bouton **« Use this template » → Create a new repository** → clone-le.
- Ou en CLI : `gh repo create mon-projet --template Ceyrocx/Web-basic-template --private --clone`

→ Tu obtiens tous les fichiers avec un **historique git neuf**.

**Alternative sans la fonction template :**
```bash
git clone https://github.com/Ceyrocx/Web-basic-template.git mon-projet
cd mon-projet
rm -rf .git && git init && git add . && git commit -m "Initial commit from template"
```

---

## ✏️ 2. Renommer l'identité du projet

Cherche/remplace dans ces fichiers :

| Fichier | Chercher | Remplacer par |
|---|---|---|
| `frontend/package.json` | `"name": "frontend"` | nom du projet |
| `backend/pyproject.toml` | `name = "backend"` | nom du projet |
| `frontend/index.html` | `<title>frontend</title>` | titre de l'onglet |
| `backend/app/main.py` | `FastAPI(title="API")` | titre de l'API (Swagger) |
| `Readme.md` | le titre `# 🚀 Fullstack Starter…` | ton titre |
| `Readme.md` | badge CI `Ceyrocx/Web-basic-template` | `OWNER/NOUVEAU-REPO` |
| `LICENSE` | `Copyright (c) 2026 Cédric Soyer` | année / nom |
| `frontend/public/favicon.svg` | l'icône par défaut | ton logo *(optionnel)* |

> ⚠️ Ne touche pas à `bun.lock` / `uv.lock` : ils se régénèrent avec `bun install` / `uv sync`.

---

## 🔐 3. Secrets & fichiers `.env`

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Fichier | Variable | Action |
|---|---|---|
| `.env` (racine) | `POSTGRES_PASSWORD` | **mets un vrai mot de passe** |
| `.env` (racine) | `POSTGRES_USER` / `POSTGRES_DB` | adapte *(optionnel)* |
| `backend/.env` | `DATABASE_URL` | **même mot de passe** que ci-dessus |
| `frontend/.env` | `VITE_API_URL` | change si l'URL de l'API diffère |

> Le défaut dans `backend/app/core/config.py` est juste un filet de secours (le `.env` l'écrase).
> Si tu ajoutes l'auth (voir EXTENSIONS.md) : génère un `SECRET_KEY` → `python -c "import secrets; print(secrets.token_hex(32))"`.

---

## 🗃️ 4. Remplacer le domaine de démo « Item »

L'exemple `Item` (page Hello World + formulaire) touche ces fichiers. **Garde-le**, **renomme-le** en ton entité, ou **supprime-le**.

**Backend :**
- `backend/app/models/item.py` · `schemas/item.py` · `crud/item.py` · `api/routes/items.py`
- `backend/app/main.py` (l'`include_router(items.router…)`)
- `backend/alembic/env.py` (l'import `Item`)
- `backend/tests/conftest.py` (l'import `Item`)
- `backend/alembic/versions/*_create_item_table.py` (la migration)

**Frontend :**
- `frontend/src/api/items.ts` · `schemas/item.ts` · `hooks/useItems.ts`
- `frontend/src/pages/Home.tsx` (+ `Home.test.tsx`)

**Textes cosmétiques « Hello World » :** `backend/app/api/routes/health.py`, `backend/tests/test_health.py`, `frontend/src/pages/Home.tsx`, `Home.test.tsx`.

**Pour repartir de zéro :**
```bash
rm backend/app/models/item.py backend/app/schemas/item.py \
   backend/app/crud/item.py backend/app/api/routes/items.py \
   backend/alembic/versions/*_create_item_table.py
# retire les imports/routes Item de : main.py, alembic/env.py, conftest.py
# puis régénère une migration propre :
make migration m="init"
```

---

## 🐳 5. Nommage Docker

Les conteneurs/volumes prennent le nom du dossier. Pour le fixer, ajoute dans `.env` racine :
```dotenv
COMPOSE_PROJECT_NAME=mon-projet
```

---

## ▶️ 6. Mise en route

```bash
# dépendances
cd backend && uv sync && cd ../frontend && bun install && cd ..

# hooks pre-commit
uv tool install pre-commit && pre-commit install

# base + migration + lancement (dev, hot-reload)
make up
```

Puis : `git remote add origin <url>` + `git push -u origin main` → active la **CI** et **Dependabot**.

---

## 🎛️ 7. Optionnel

| Sujet | Où | Quand |
|---|---|---|
| Ports (`DB_PORT`, `BACKEND_PORT`, `FRONTEND_PORT`) | `.env` racine | conflit de port |
| CORS (`CORS_ORIGINS`) | `docker-compose.yml` + `backend/.env` | l'URL du front change |
| Auth (JWT) | recette dans [EXTENSIONS.md](EXTENSIONS.md) | quand tu en as besoin |
| 3D (react-three-fiber) | recette dans [EXTENSIONS.md](EXTENSIONS.md) | quand tu en as besoin |
