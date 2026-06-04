# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# VITE_API_BASE_URL must be set at build time — Vite inlines VITE_* vars
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ─── Stage 2: Production (nginx) ─────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our SPA-aware nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
