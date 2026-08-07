# syntax=docker/dockerfile:1

# ============================================================
# Stage 1: Build the Vite production bundle
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Build-time env vars are compiled into the bundle by Vite
# (browser runs on host: API base + asset base point at published ports)
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ARG VITE_ASSET_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ASSET_BASE_URL=$VITE_ASSET_BASE_URL

RUN npm run build

# ============================================================
# Stage 2: Serve the static build with Nginx
# ============================================================
FROM nginx:1.27-alpine

# SPA fallback + security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx static assets, copy the built site
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://localhost/ || exit 1