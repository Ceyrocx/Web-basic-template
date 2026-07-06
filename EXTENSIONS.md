# 🧩 Extensions — recettes optionnelles

> **Ce ne sont PAS des fichiers du repo.** C'est un carnet de recettes : suis la section quand tu veux **ajouter** la feature à un projet. Les commentaires du code ci-dessous sont **pédagogiques** (comme le Readme) — dans ton vrai code, garde le strict essentiel.

Deux add-ons volontairement **hors socle** (voir Readme → « Prochaines étapes ») :
- [🔐 Auth (JWT)](#-auth-jwt)
- [🎨 3D avec react-three-fiber](#-3d-avec-react-three-fiber)

---

## 🔐 Auth (JWT)

Authentification par **token JWT** : `register` → `login` (renvoie un token) → routes protégées via `get_current_user`. S'intègre pile dans la structure existante (`core/`, `models/`, `schemas/`, `crud/`, `api/`).

**Le flux :**
```
POST /api/auth/register  → crée un User (mot de passe hashé)
POST /api/auth/login     → vérifie → renvoie { access_token }
GET  /api/auth/me        → route protégée (Authorization: Bearer <token>)
```

### 1) Dépendances

```bash
cd backend
uv add pyjwt "pwdlib[argon2]"
```
- `pyjwt` → encode/décode les JWT.
- `pwdlib[argon2]` → hash des mots de passe (argon2, recommandé ; maintenu, contrairement à `passlib`).

### 2) `app/core/config.py` — ajoute 3 réglages

```python
class Settings(BaseSettings):
    # ... existing fields ...
    SECRET_KEY: str = "change-me-in-prod"          # signs the JWTs — ALWAYS override via env in prod!
    ALGORITHM: str = "HS256"                        # JWT signing algorithm
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24      # token lifetime (24h)
```
> Ajoute `SECRET_KEY` à ton `.env` racine + `backend/.env` + au bloc `environment` du `backend` dans `docker-compose.yml`. Génère-le : `python -c "import secrets; print(secrets.token_hex(32))"`.

### 3) `app/core/security.py` — hashing + JWT

```python
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

_password_hash = PasswordHash.recommended()   # argon2


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _password_hash.verify(password, hashed)


def create_access_token(subject: str) -> str:
    # `sub` = who the token is for (here: the user's email); `exp` = expiry
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": subject, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    # Returns the subject (email) if the token is valid, else None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
```

### 4) `app/models/user.py` — la table

```python
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)   # unique login
    hashed_password: str                          # NEVER store the plain password
```

### 5) `app/schemas/user.py` — I/O

```python
from sqlmodel import SQLModel


class UserCreate(SQLModel):    # registration input
    email: str
    password: str


class UserRead(SQLModel):      # public output — never exposes hashed_password
    id: int
    email: str


class Token(SQLModel):         # login response
    access_token: str
    token_type: str = "bearer"
```

### 6) `app/crud/user.py`

```python
from sqlmodel import Session, select

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def create_user(session: Session, user_in: UserCreate) -> User:
    user = User(email=user_in.email, hashed_password=hash_password(user_in.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate(session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session, email)
    if user and verify_password(password, user.hashed_password):
        return user
    return None
```

### 7) `app/api/deps.py` — ajoute `get_current_user`

```python
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.security import decode_access_token
from app.crud.user import get_user_by_email
from app.db.session import get_session
from app.models.user import User

SessionDep = Annotated[Session, Depends(get_session)]

# tokenUrl must match the login route (used by Swagger's "Authorize" button)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    email = decode_access_token(token)
    if email is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    user = get_user_by_email(session, email)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]   # reusable alias for protected routes
```

### 8) `app/api/routes/auth.py`

```python
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, SessionDep
from app.core.security import create_access_token
from app.crud.user import authenticate, create_user, get_user_by_email
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, session: SessionDep) -> User:
    if get_user_by_email(session, user_in.email):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")
    return create_user(session, user_in)


@router.post("/login", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep) -> Token:
    # OAuth2 form sends "username" + "password" (we use the email as the username)
    user = authenticate(session, form.username, form.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    return Token(access_token=create_access_token(subject=user.email))


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser) -> User:
    return current_user
```

### 9) `app/main.py` — branche le router

```python
from app.api.routes import auth, health, items   # add `auth`
# ...
app.include_router(auth.router, prefix="/api")    # add this line
```

### 10) Migration

Importe le modèle dans `alembic/env.py` (sinon la migration serait vide) :
```python
from app.models.user import User  # noqa: F401
```
Puis :
```bash
uv run alembic revision --autogenerate -m "create user table"
uv run alembic upgrade head
```

### 🛡️ Protéger une route

Ajoute `current_user: CurrentUser` à n'importe quelle route → elle exige un token valide :
```python
from app.api.deps import CurrentUser

@router.post("/items", response_model=ItemRead)
def add_item(item_in: ItemCreate, session: SessionDep, current_user: CurrentUser) -> Item:
    return create_item(session, item_in)   # only reachable with a valid token
```

### ✅ Test (`tests/test_auth.py`)

```python
def test_register_login_me(client):
    # register
    r = client.post("/api/auth/register", json={"email": "a@b.com", "password": "secret123"})
    assert r.status_code == 200

    # login (form-encoded → use data=, not json=)
    r = client.post("/api/auth/login", data={"username": "a@b.com", "password": "secret123"})
    token = r.json()["access_token"]

    # protected route with the Bearer token
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.json()["email"] == "a@b.com"
```
> Réutilise la fixture `client` (SQLite en mémoire) déjà en place → aucune config en plus.

---

### ⚛️ Intégration frontend (optionnelle)

**a) Attacher le token à chaque requête** — dans `src/api/axiosInstance.ts` :
```ts
// Attach the JWT (if any) to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

**b) `src/api/auth.ts`**
```ts
import axiosInstance from './axiosInstance'

export async function login(email: string, password: string): Promise<string> {
  // /login expects form-encoded "username" + "password"
  const body = new URLSearchParams({ username: email, password })
  const res = await axiosInstance.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data.access_token as string
}

export async function register(email: string, password: string) {
  return (await axiosInstance.post('/auth/register', { email, password })).data
}

export async function me() {
  return (await axiosInstance.get('/auth/me')).data
}
```

**c) Usage** — après un login réussi, stocke le token puis rafraîchis les données :
```ts
const token = await login(email, password)
localStorage.setItem('token', token)         // now every request is authenticated
// then navigate / invalidate queries as needed
```

**Pour aller plus loin :** un `AuthContext` (ou un hook `useAuth`) qui expose `user`, `login`, `logout`, protège les routes (`<RequireAuth>`), et charge `me()` au démarrage. Le token en `localStorage` est simple ; pour plus de sécurité, envisage un cookie `httpOnly` côté backend.

---

## 🎨 3D avec react-three-fiber

Pour de la 3D dans un projet (hero animé, viewer…). **Hors socle** car lourd et de niche.

### Installation
```bash
cd frontend
bun add three @react-three/fiber @react-three/drei
```
- `@react-three/fiber` (R3F) → le **moteur de rendu React pour Three.js** (déclaratif).
- `@react-three/drei` → des helpers prêts à l'emploi (contrôles, chargeurs…).

### `src/components/Scene.tsx`
```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'

function SpinningCube() {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta   // animation loop (per frame)
  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />              {/* JSX tag = a Three.js object */}
      <meshStandardMaterial color="mediumpurple" />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas style={{ height: 400 }} camera={{ position: [3, 3, 3] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} />
      <SpinningCube />
      <OrbitControls />                             {/* orbit with the mouse */}
    </Canvas>
  )
}
```

### Usage
```tsx
import Scene from '../components/Scene'
// ...
<Scene />
```

### À retenir
- R3F est **déclaratif** : chaque balise JSX (`<mesh>`, `<boxGeometry>`…) crée un objet Three.js.
- `useFrame` = la **boucle d'animation** (appelée à chaque frame).
- Cohabite avec **Mantine** sans souci (un `<Canvas>` WebGL + le DOM Mantine autour).
- **Perf** : Three.js est lourd (~150 Ko gzip) → charge la scène en **lazy** (`React.lazy`) si elle n'est pas visible d'emblée.

---

_Ces recettes complètent le [Readme](Readme.md). Ajoute-les à la carte, projet par projet._
