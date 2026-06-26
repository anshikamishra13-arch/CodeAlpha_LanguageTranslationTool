# ─────────────────────────────────────────
#  Stage 1: Build / install dependencies
# ─────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy only package files first for better layer caching
COPY backend/package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# ─────────────────────────────────────────
#  Stage 2: Production image
# ─────────────────────────────────────────
FROM node:18-alpine AS runner

# Security: run as non-root user
RUN addgroup -S linguaai && adduser -S linguaai -G linguaai

WORKDIR /app

# Copy installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source code
COPY backend/ .

# Own everything as the non-root user
RUN chown -R linguaai:linguaai /app

USER linguaai

# Expose the Express port
EXPOSE 5000

# Health check – matches /api/health in the app
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
