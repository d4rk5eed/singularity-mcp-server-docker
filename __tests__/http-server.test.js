"use strict";

const { test } = require("node:test");
const assert = require("node:assert");

// ============================================================================
// SimpleHTTPTransport для тестирования
// ============================================================================

/**
 * SimpleHTTPTransport — копируем класс для unit-тестов
 */
class SimpleHTTPTransport {
  onmessage = null;

  constructor() {
    this._responsePromise = new Promise((resolve) => {
      this._responseResolve = resolve;
    });
  }

  async start() {
    // no-op
  }

  send(message) {
    if (this._responseResolve) {
      this._responseResolve(message);
    }
  }

  close() {
    // no-op
  }

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
// Тесты
// ============================================================================

test("SimpleHTTPTransport: конструктор инициализирует поля", (t, done) => {
  const transport = new SimpleHTTPTransport();
  assert.strictEqual(transport.onmessage, null, "onmessage должен быть null");
  assert.ok(transport._responsePromise, "_responsePromise должен существовать");
  assert.ok(transport._responseResolve, "_responseResolve должен существовать");
  done();
});

test("SimpleHTTPTransport: start() — no-op метод", async (t) => {
  const transport = new SimpleHTTPTransport();
  const result = await transport.start();
  assert.strictEqual(result, undefined, "start() должен возвращать undefined");
});

test("SimpleHTTPTransport: send() резолвит Promise", async (t) => {
  const transport = new SimpleHTTPTransport();
  const testMessage = {
    jsonrpc: "2.0",
    id: 1,
    result: { content: [{ type: "text", text: "test" }] },
  };

  // Запускаем waitForResponse в фоне
  const responsePromise = transport.waitForResponse(5000);

  // Даём время на инициализацию
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Отправляем сообщение
  transport.send(testMessage);

  // Проверяем, что получили правильное сообщение
  const response = await responsePromise;
  assert.deepStrictEqual(response, testMessage, "Ответ должен совпадать");
});

test("SimpleHTTPTransport: waitForResponse с таймаутом", async (t) => {
  const transport = new SimpleHTTPTransport();
  const shortTimeout = 100;

  try {
    await transport.waitForResponse(shortTimeout);
    assert.fail("Должна была выброшена ошибка таймаута");
  } catch (error) {
    assert.match(error.message, /MCP timeout/, "Ошибка должна быть о таймауте");
    assert.match(error.message, /100ms/, "Ошибка должна содержать 100ms");
  }
});

test("SimpleHTTPTransport: close() — no-op метод", (t, done) => {
  const transport = new SimpleHTTPTransport();
  const result = transport.close();
  assert.strictEqual(result, undefined, "close() должен возвращать undefined");
  done();
});

// ============================================================================
// Тесты обработки JSON-RPC запросов (мок-версия)
// ============================================================================

/**
 * Мок-версия handleMcpRequest для тестирования логики
 */
async function mockHandleMcpRequest(requestBody, shouldFail = false) {
  try {
    // Проверяем req.body
    if (!requestBody || typeof requestBody !== "object") {
      return {
        status: 400,
        body: {
          jsonrpc: "2.0",
          error: { code: -32700, message: "Parse error" },
          id: null,
        },
      };
    }

    // Имитируем SDK обработку
    const transport = new SimpleHTTPTransport();

    // SDK устанавливает onmessage
    transport.onmessage = (msg) => {
      // Имитируем обработку различных методов
      if (msg.method === "tools/call") {
        const result = {
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify([{ id: "1", title: "Test" }]),
              },
            ],
          },
        };
        setTimeout(() => transport.send(result), 5);
      } else if (msg.method === "initialize") {
        const result = {
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: { name: "test", version: "1.0" },
          },
        };
        setTimeout(() => transport.send(result), 5);
      } else {
        const result = {
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32601, message: "Method not found" },
        };
        setTimeout(() => transport.send(result), 5);
      }
    };

    if (shouldFail) {
      throw new Error("Simulated failure");
    }

    // Guard проверка
    if (typeof transport.onmessage !== "function") {
      throw new Error("SDK did not set onmessage handler");
    }

    // Вызываем обработчик
    transport.onmessage(requestBody);

    // Ожидаем ответ
    const response = await transport.waitForResponse(5000);

    return {
      status: 200,
      body: response,
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        jsonrpc: "2.0",
        id: requestBody?.id || null,
        error: { code: -32603, message: error.message },
      },
    };
  }
}

test("mockHandleMcpRequest: пустое тело → 400", async (t) => {
  const result = await mockHandleMcpRequest(null);
  assert.strictEqual(result.status, 400, "Статус должен быть 400");
  assert.strictEqual(
    result.body.error.code,
    -32700,
    "Ошибка должна быть -32700",
  );
});

test("mockHandleMcpRequest: tools/call → 200 с result", async (t) => {
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "listTasks", arguments: {} },
  };

  const result = await mockHandleMcpRequest(request);

  assert.strictEqual(result.status, 200, "Статус должен быть 200");
  assert.strictEqual(result.body.id, 1, "ID должен совпадать");
  assert.ok(result.body.result, "result должен присутствовать");
  assert.ok(result.body.result.content, "content должен присутствовать");
});

test("mockHandleMcpRequest: initialize → 200 с result", async (t) => {
  const request = {
    jsonrpc: "2.0",
    id: 2,
    method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {} },
  };

  const result = await mockHandleMcpRequest(request);

  assert.strictEqual(result.status, 200, "Статус должен быть 200");
  assert.ok(result.body.result, "result должен присутствовать");
  assert.ok(result.body.result.serverInfo, "serverInfo должен присутствовать");
});

test("mockHandleMcpRequest: неизвестный метод → JSON-RPC error", async (t) => {
  const request = {
    jsonrpc: "2.0",
    id: 3,
    method: "unknownMethod",
    params: {},
  };

  const result = await mockHandleMcpRequest(request);

  assert.strictEqual(result.status, 200, "Статус должен быть 200");
  assert.ok(result.body.error, "error должен присутствовать");
  assert.strictEqual(
    result.body.error.code,
    -32601,
    "Ошибка должна быть -32601",
  );
});

test("mockHandleMcpRequest: исключение → 500", async (t) => {
  const request = {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {},
  };

  const result = await mockHandleMcpRequest(request, true);

  assert.strictEqual(result.status, 500, "Статус должен быть 500");
  assert.ok(result.body.error, "error должен присутствовать");
  assert.strictEqual(
    result.body.error.code,
    -32603,
    "Ошибка должна быть -32603",
  );
});

test("mockHandleMcpRequest: сохранение ID в параллельных запросах", async (t) => {
  const request1 = {
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: { name: "listTasks", arguments: {} },
  };

  const request2 = {
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: { name: "listProjects", arguments: {} },
  };

  // Запускаем параллельно
  const [result1, result2] = await Promise.all([
    mockHandleMcpRequest(request1),
    mockHandleMcpRequest(request2),
  ]);

  assert.strictEqual(result1.body.id, 10, "Первый ответ должен иметь id=10");
  assert.strictEqual(result2.body.id, 11, "Второй ответ должен иметь id=11");
  assert.strictEqual(result1.status, 200, "Первый статус должен быть 200");
  assert.strictEqual(result2.status, 200, "Второй статус должен быть 200");
});
