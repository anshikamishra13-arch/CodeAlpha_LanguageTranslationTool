# ─────────────────────────────────────────
#  Stage 1: Build Vite / React app
# ─────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY Frontend/package*.json ./

# Install ALL deps (dev deps needed for Vite build)
RUN npm ci

# Copy frontend source
COPY Frontend/ .

# VITE_API_URL must be passed at build time:
#   docker build --build-arg VITE_API_URL=https://api.yourbackend.com
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the static assets
RUN npm run build

# ─────────────────────────────────────────
#  Stage 2: Serve with lightweight Nginx
# ─────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add our custom config (handles React Router)
COPY --from=builder /app/dist /usr/share/nginx/html

# Inline nginx config for React SPA routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Enable gzip compression\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n\
\n\
    # Cache static assets aggressively\n\
    location ~* \\.(js|css|png|svg|ico|woff2?)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # Fallback to index.html for React Router\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Security headers\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
}\n' > /etc/nginx/conf.d/app.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
