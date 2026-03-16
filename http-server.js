"use strict";

/**
 * HTTP Server для Singularity MCP
 *
 * Реализует SimpleHTTPTransport для работы с MCP SDK.
 * Каждый HTTP-запрос POST /mcp создаёт новый экземпляр
 * SingularityMcpServer и SimpleHTTPTransport (stateless).
 */

const express = require("express");
const cors = require("cors");
const { SingularityMcpServer } = require("./server");
const dotenv = require("dotenv");

dotenv.config();

// ============================================================================
// SimpleHTTPTransport: HTTP-транспорт для MCP SDK
// ============================================================================

/**
 * Простой HTTP-транспорт для MCP SDK.
 * Один экземпляр — один HTTP-запрос. Stateless.
 * SDK устанавливает this.onmessage при connect(), мы вызываем его вручную.
 */
class SimpleHTTPTransport {
  /**
   * Публичное поле; инициализируется null.
   * SDK запишет handler при connect().
   * @type {Function | null}
   */
  onmessage = null;

  constructor() {
    /**
     * Promise для ожидания ответа от SDK.
     * SDK вызовет send(msg) → резолвит Promise.
     * @type {Promise<object>}
     * @private
     */
    this._responsePromise = new Promise((resolve) => {
      /**
       * Резолвер для Promise ответа.
       * @type {Function}
       * @private
       */
      this._responseResolve = resolve;
    });
  }

  /**
   * no-op; требуется интерфейсом MCP SDK.
   * @returns {Promise<void>}
   */
  async start() {
    // Ничего не делаем
  }

  /**
   * Резолвит _responsePromise с ответом от SDK.
   * Исключений не бросает — SDK гарантирует валидное сообщение.
   * @param {object} message - JSON-RPC ответ от SDK
   */
  send(message) {
    if (this._responseResolve) {
      this._responseResolve(message);
    }
  }

  /**
   * no-op; требуется интерфейсом MCP SDK.
   */
  close() {
    // Ничего не делаем
  }

  /**
   * Ожидает ответ от SDK с таймаутом.
   * @param {number} [timeoutMs] - мс ожидания (дефолт: MCP_TIMEOUT_MS env, иначе 30000)
   * @returns {Promise<object>} - JSON-RPC ответ
   * @throws {Error} - если таймаут превышен
   */
  async waitForResponse(timeoutMs) {
    const timeout =
      timeoutMs || parseInt(process.env.MCP_TIMEOUT_MS || "30000");

    return Promise.race([
      this._responsePromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`MCP timeout after ${timeout}ms`)),
          timeout,
        ),
      ),
    ]);
  }
}

// ============================================================================
// Конфигурация
// ============================================================================

const SINGULARITY_API_URL =
  process.env.SINGULARITY_API_URL || "https://api.singularity-app.com";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const PORT = parseInt(process.env.PORT || "3000");
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const CORS_ORIGINS = (
  process.env.CORS_ORIGINS || "http://localhost:3000"
).split(",");
const MCP_TIMEOUT_MS = parseInt(process.env.MCP_TIMEOUT_MS || "30000");

/**
 * Обрабатывает POST /mcp.
 * Создаёт новый SingularityMcpServer и SimpleHTTPTransport на каждый вызов.
 * Весь блок обёрнут в try/catch (Express 4 не ловит async ошибки).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function handleMcpRequest(req, res) {
  try {
    // Проверяем req.body — если null или не объект → 400
    if (!req.body || typeof req.body !== "object") {
      console.warn("POST /mcp: invalid body (null or not an object)");
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
        },
        id: null,
      });
    }

    const requestId = req.body.id;
    const method = req.body.method;

    console.info(`POST /mcp id=${requestId} method=${method}`);

    // Создаём новый SingularityMcpServer на каждый запрос
    const mcpServer = new SingularityMcpServer({
      baseUrl: SINGULARITY_API_URL,
      accessToken: REFRESH_TOKEN,
      enableLogging: true,
      logLevel: LOG_LEVEL,
    });

    // Создаём новый SimpleHTTPTransport на каждый запрос
    const transport = new SimpleHTTPTransport();

    // Подключаем сервер к транспорту
    // SDK установит transport.onmessage = <handler>
    await mcpServer.connect(transport);

    // Guard: проверяем, что SDK установил обработчик
    if (typeof transport.onmessage !== "function") {
      throw new Error("SDK did not set onmessage handler");
    }

    console.debug(`SimpleHTTPTransport connected, onmessage installed`);
    console.debug(`Delivering message to SDK: ${method}`);

    // Вызываем обработчик SDK вручную
    // Это заставляет SDK найти нужный tool handler и вызвать его
    transport.onmessage(req.body);

    // Ожидаем ответ от SDK с таймаутом
    const response = await transport.waitForResponse(MCP_TIMEOUT_MS);

    console.info(`POST /mcp id=${requestId} → status=200`);

    // Отправляем JSON-RPC ответ
    return res.status(200).json(response);
  } catch (error) {
    const requestId = req.body?.id;
    const message = error.message || "Unknown error";

    console.error(`POST /mcp error: ${message}`);

    // Если заголовки уже отправлены, ничего не делаем
    if (res.headersSent) {
      return;
    }

    // Определяем, timeout ли это
    const isTimeout = message.includes("timeout");
    const statusCode = isTimeout ? 200 : 500;
    const errorCode = -32603;

    return res.status(statusCode).json({
      jsonrpc: "2.0",
      id: requestId || null,
      error: {
        code: errorCode,
        message: message,
      },
    });
  }
}

/**
 * Запускает Express HTTP-сервер на порту PORT.
 * Регистрирует обработчик SIGTERM для graceful shutdown.
 *
 * @returns {Promise<void>}
 */
async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(
    cors({
      origin: CORS_ORIGINS,
      allowedHeaders: ["Content-Type"],
    }),
  );

  // Вывод конфигурации при запуске
  console.info(`REFRESH_TOKEN: ${REFRESH_TOKEN ? "[set]" : "[not set]"}`);
  console.info(`LOG_LEVEL: ${LOG_LEVEL}`);
  console.info(`MCP_TIMEOUT_MS: ${MCP_TIMEOUT_MS}`);

  // GET /health — проверка работоспособности
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      version: "2.1.1",
      mode: "http",
      apiUrl: SINGULARITY_API_URL,
    });
  });

  // POST /mcp — обработка JSON-RPC запросов
  app.post("/mcp", handleMcpRequest);

  // Запускаем сервер
  const httpServer = app.listen(PORT, () => {
    console.info(`HTTP server listening on port ${PORT}`);
  });

  // Graceful shutdown при SIGTERM
  process.on("SIGTERM", () => {
    console.info("SIGTERM received, shutting down gracefully");
    httpServer.close(() => {
      process.exit(0);
    });
  });
}

// Экспортируем функцию запуска
module.exports = { startServer };

// Если запущен напрямую
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
