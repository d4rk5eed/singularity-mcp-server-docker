# ─── Runtime stage ────────────────────────────────────────────────────────────
# Сборка из локальной файловой системы — без скачивания .mcpb из сети.
# Зависимости устанавливаются через npm ci для надёжности.
FROM node:20-alpine

WORKDIR /app

# Копируем package.json для установки зависимостей
# package-lock.json опционален — если есть, npm ci использует его
COPY package.json ./
COPY package-lock.json* ./

# Устанавливаем только production зависимости
RUN npm install --omit=dev --ignore-scripts

# Копируем предсобранные JS-файлы приложения
COPY client.js \
     http-server.js \
     index.js \
     mcp.js \
     server.js \
     types.js \
     manifest.json \
     logo.png \
     ./

# Копируем модули и утилиты
COPY modules/ ./modules/
COPY utils/   ./utils/

# ── Environment variables ─────────────────────────────────────────────────────
# Базовый URL Singularity API (переопределяется для self-hosted)
ENV SINGULARITY_API_URL="https://api.singularity-app.com"

# Токен доступа — ОБЯЗАТЕЛЕН при запуске контейнера:
#   docker run -e REFRESH_TOKEN=<your-token> ...
ENV REFRESH_TOKEN=""

# Порт HTTP-сервера
ENV PORT="3000"

# Уровень логирования: debug | info | warn | error
ENV LOG_LEVEL="info"

# Разрешённые CORS-источники (через запятую)
ENV CORS_ORIGINS="http://localhost:3000"

# Демо-режим — "true" для запуска без токена (вызовы API имитируются)
ENV DEMO_MODE="false"

# Таймаут ожидания ответа MCP SDK в миллисекундах
ENV MCP_TIMEOUT_MS="30000"

# ── Entrypoint script ─────────────────────────────────────────────────────────
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

EXPOSE 3000

STOPSIGNAL SIGTERM

ENTRYPOINT ["/app/docker-entrypoint.sh"]
