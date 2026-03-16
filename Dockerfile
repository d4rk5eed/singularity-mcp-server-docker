# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

# Install tools needed to download and unpack the .mcpb bundle (plain ZIP)
RUN apk add --no-cache curl unzip

WORKDIR /app

# Download and extract the MCP server bundle
RUN curl -fsSL \
      https://me.singularity-app.com/download/singularity-mcp-server-2.1.1.mcpb \
      -o /tmp/server.mcpb \
    && unzip /tmp/server.mcpb -d /app \
    && rm /tmp/server.mcpb

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy extracted application files from the build stage
COPY --from=base /app /app

# ── Environment variables ─────────────────────────────────────────────────────
# Singularity API base URL (override for self-hosted instances)
ENV SINGULARITY_API_URL="https://api.singularity-app.com"

# Access token – MUST be provided at container runtime:
#   docker run -e REFRESH_TOKEN=<your-token> ...
ENV REFRESH_TOKEN=""

# HTTP port the Express server will listen on
ENV PORT="3000"

# Log level: debug | info | warn | error
ENV LOG_LEVEL="info"

# Allowed CORS origins (comma-separated)
ENV CORS_ORIGINS="http://localhost:3000"

# Demo mode – set to "true" to run without a real token (API calls are mocked)
ENV DEMO_MODE="false"

# ── Entrypoint script ─────────────────────────────────────────────────────────
# Written via RUN printf so the script is baked into the image without requiring
# BuildKit heredoc support (works with both legacy and BuildKit builders).
RUN printf '%s\n' \
    '#!/bin/sh' \
    'set -e' \
    '' \
    'if [ -z "${REFRESH_TOKEN}" ] && [ "${DEMO_MODE}" != "true" ]; then' \
    '  echo "[singularity-mcp] ERROR: REFRESH_TOKEN is not set." >&2' \
    '  echo "[singularity-mcp] Provide it with: docker run -e REFRESH_TOKEN=<token> ..." >&2' \
    '  echo "[singularity-mcp] Or set DEMO_MODE=true to start without a token." >&2' \
    '  exit 1' \
    'fi' \
    '' \
    'exec node /app/http-server.js' \
    > /app/docker-entrypoint.sh \
    && chmod +x /app/docker-entrypoint.sh

# Expose the HTTP port (matches the PORT env var default)
EXPOSE 3000

STOPSIGNAL SIGTERM

ENTRYPOINT ["/app/docker-entrypoint.sh"]
