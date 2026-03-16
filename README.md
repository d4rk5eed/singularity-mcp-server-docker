# singularity-mcp-server — Docker

Docker-упаковка для [Singularity MCP Server](https://singularity-app.com) — сервера протокола [Model Context Protocol](https://modelcontextprotocol.io), который предоставляет AI-ассистентам инструменты для управления задачами, проектами и привычками в Singularity.

---

## Содержание

- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Сборка образа](#сборка-образа)
- [Запуск контейнера](#запуск-контейнера)
  - [docker run](#docker-run)
  - [docker compose](#docker-compose)
- [Переменные среды](#переменные-среды)
- [Эндпоинты](#эндпоинты)
- [Настройка MCP-клиента](#настройка-mcp-клиента)
- [Ресурсы и лимиты](#ресурсы-и-лимиты)
- [Структура образа](#структура-образа)

---

## Требования

| Инструмент | Минимальная версия |
|---|---|
| Docker | 20.10+ |
| Docker Compose | v2.0+ (плагин `docker compose`) |

Интернет-соединение на этапе сборки — образ скачивает пакет сервера с `me.singularity-app.com`.

---

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd singularity-mcp-server-docker

# 2. Создать файл с переменными среды
echo "REFRESH_TOKEN=ваш_токен" > .env

# 3. Собрать и запустить
docker compose up --build -d

# 4. Проверить работу
curl http://localhost:3000/health
```

---

## Сборка образа

Сборка использует **multi-stage build**: на первом этапе скачивается и распаковывается `.mcpb`-пакет сервера, на втором — собирается минимальный runtime-образ.

```bash
docker build -t singularity-mcp-server:2.1.1 .
```

Что происходит при сборке:

1. **base stage** — устанавливается `curl` и `unzip`, скачивается архив `singularity-mcp-server-2.1.1.mcpb` с официального сервера, распаковывается в `/app`
2. **runtime stage** — копируются только распакованные файлы приложения, создаётся `docker-entrypoint.sh`, открывается порт `3000`

Итоговый размер образа: **~139 МБ** (на базе `node:20-alpine`).

---

## Запуск контейнера

### docker run

**Минимальный запуск** (только обязательный токен):

```bash
docker run -d \
  -p 3000:3000 \
  -e REFRESH_TOKEN=ваш_токен \
  singularity-mcp-server:2.1.1
```

**Расширенный запуск** со всеми параметрами:

```bash
docker run -d \
  --name singularity-mcp \
  --restart unless-stopped \
  -p 3000:3000 \
  -e REFRESH_TOKEN=ваш_токен \
  -e SINGULARITY_API_URL=https://api.singularity-app.com \
  -e LOG_LEVEL=info \
  -e CORS_ORIGINS=http://localhost:3000,http://myapp.example.com \
  singularity-mcp-server:2.1.1
```

**Демо-режим** (без токена, API-вызовы имитируются):

```bash
docker run -d \
  -p 3000:3000 \
  -e DEMO_MODE=true \
  singularity-mcp-server:2.1.1
```

### docker compose

1. Создайте файл `.env` рядом с `docker-compose.yml`:

```env
# Обязательно
REFRESH_TOKEN=ваш_токен_здесь

# Опционально (значения по умолчанию показаны ниже)
# HOST_PORT=3000
# SINGULARITY_API_URL=https://api.singularity-app.com
# LOG_LEVEL=info
# CORS_ORIGINS=http://localhost:3000
# DEMO_MODE=false
```

2. Запустите:

```bash
# Первый запуск (сборка + старт)
docker compose up --build -d

# Последующие запуски
docker compose up -d

# Просмотр логов
docker compose logs -f singularity-mcp

# Остановка
docker compose down
```

Чтобы использовать другой порт на хосте без правки `docker-compose.yml`:

```bash
HOST_PORT=8080 docker compose up -d
```

---

## Переменные среды

| Переменная | Обязательная | По умолчанию | Описание |
|---|---|---|---|
| `REFRESH_TOKEN` | **Да** ¹ | — | Токен доступа к Singularity API |
| `SINGULARITY_API_URL` | Нет | `https://api.singularity-app.com` | Базовый URL API (для self-hosted инстансов) |
| `PORT` | Нет | `3000` | Порт HTTP-сервера внутри контейнера |
| `LOG_LEVEL` | Нет | `info` | Уровень логирования: `debug` / `info` / `warn` / `error` |
| `CORS_ORIGINS` | Нет | `http://localhost:3000` | Разрешённые CORS-источники (через запятую) |
| `DEMO_MODE` | Нет | `false` | Запуск без токена с имитацией API-вызовов (`true` / `false`) |

¹ Обязателен, если `DEMO_MODE` не установлен в `true`. При запуске без токена контейнер завершится с ошибкой и подсказкой.

> **Безопасность:** не передавайте `REFRESH_TOKEN` напрямую в `docker-compose.yml`. Используйте файл `.env` (добавьте его в `.gitignore`) или Docker Secrets.

---

## Эндпоинты

После запуска контейнер предоставляет два HTTP-эндпоинта:

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/health` | Проверка работоспособности сервера |
| `POST` | `/mcp` | Обработка MCP-запросов (JSON-RPC 2.0) |

**Проверка здоровья:**

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "message": "Singularity MCP Server работает",
  "apiUrl": "https://api.singularity-app.com",
  "demoMode": false
}
```

**MCP-запрос** (пример вызова инструмента):

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"listProjects","arguments":{}}}'
```

---

## Настройка MCP-клиента

### Claude Desktop / Zed / Cursor (stdio через Docker)

Для MCP-клиентов, использующих stdio-транспорт, контейнер запускается как дочерний процесс. Добавьте в конфиг MCP-клиента:

```json
{
  "mcpServers": {
    "singularity": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "--entrypoint", "node",
        "singularity-mcp-server:2.1.1",
        "/app/mcp.js",
        "--accessToken", "ваш_токен",
        "--noLog"
      ]
    }
  }
}
```

> **Примечание:** флаг `--noLog` обязателен в stdio-режиме — логи идут в stdout и могут нарушить MCP-протокол.

### Клиенты с HTTP-транспортом

Укажите MCP-эндпоинт запущенного контейнера:

```
http://localhost:3000/mcp
```

---

## Ресурсы и лимиты

В `docker-compose.yml` заданы ограничения по умолчанию (можно изменить):

| Параметр | Значение |
|---|---|
| CPU limit | 0.5 ядра |
| Memory limit | 256 МБ |
| Memory reservation | 64 МБ |

Health check проверяет `/health` каждые **30 секунд** (`start_period: 10s`, `retries: 3`).

---

## Структура образа

```
/app/
├── mcp.js              # Точка входа (stdio-режим)
├── http-server.js      # Точка входа (HTTP-режим, используется контейнером)
├── server.js           # Ядро MCP-сервера
├── client.js           # HTTP-клиент к Singularity API
├── index.js            # Экспорты библиотеки
├── docker-entrypoint.sh # Entrypoint: валидация токена → запуск http-server.js
├── modules/            # MCP-инструменты по сущностям (task, project, habit…)
├── utils/              # Вспомогательные утилиты (auth, response)
└── node_modules/       # Зависимости (поставляются в .mcpb-архиве)
```

---

## Лицензия

MIT — см. [manifest.json](./manifest.json).