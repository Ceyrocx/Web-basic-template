# Stage 1: build the static files with Bun
FROM oven/bun:1 AS build

WORKDIR /app

# Install deps first so this layer stays cached until the lockfiles change
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Then the source, and build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

# Stage 2: serve the build with nginx
FROM nginx:alpine AS prod

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
