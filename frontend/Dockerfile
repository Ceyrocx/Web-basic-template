# ─── Étape 1 : build des fichiers statiques avec Bun ───
FROM oven/bun:1 AS build

WORKDIR /app

# Dépendances d'abord (couche en cache tant que les lockfiles ne bougent pas)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Puis le code, et on build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

# ─── Étape 2 : servir le build avec nginx ───
FROM nginx:alpine AS prod

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
