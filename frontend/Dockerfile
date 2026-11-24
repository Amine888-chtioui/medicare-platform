# ==============================================================================
# MediCare Platform — Frontend Dockerfile (Multi-stage build)
# Node 20 / Vite 6 + React 18 / Nginx Alpine
# ==============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Cache dependencies layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy sources and configuration
COPY . .

# Build argument for backend URL (can be injected at build time)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Production Nginx web server
FROM nginx:alpine AS runtime

# Replace default configuration with SPA-optimized Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
