"use strict";

const { test } = require("node:test");
const assert = require("node:assert");

/**
 * SimpleHTTPTransport для тестирования.
 * Копируем класс сюда для unit-тестов.
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
    const timeout = timeoutMs || parseInt(process.env.MCP_TIMEOUT_MS || "30000");

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

test("SimpleHTTPTransport: инициализация", async (t) => {
  const transport = new SimpleHTTPTransport();
  assert.strictEqual(transport.onmessage, null, "onmessage должен быть null");
  assert.ok(transport._responsePromise, "_responsePromise должен существовать");
  assert.ok(transport._responseResolve, "_responseResolve должен существовать");
});

test("SimpleHTTPTransport: start() — no-op", async (t) => {
  const transport = new SimpleHTTPTransport();
  const result = await transport.start();
  assert.strictEqual(result, undefined, "start() должен возвращать undefined");
});

test("SimpleHTTPTransport: send() резолвит Promise", async (t) => {
  const transport = new SimpleHTTPTransport();
  const testMessage = { jsonrpc: "2.0", id: 1, result: { foo: "bar" } };

  // Запускаем waitForResponse в фоне
  const responsePromise = transport.waitForResponse(5000);

  // Даём фоновой задаче немного времени на инициализацию
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Отправляем сообщение
  transport.send(testMessage);

  // Проверяем, что получили правильное сообщение
  const response = await responsePromise;
  assert.deepStrictEqual(response, testMessage, "Ответ должен совпадать с отправленным");
});

test("SimpleHTTPTransport: waitForResponse с таймаутом", async (t) => {
  const transport = new SimpleHTTPTransport();
  const shortTimeout = 100;

  try {
    await transport.waitForResponse(shortTimeout);
    assert.fail("Должна была выброшена ошибка таймаута");
  } catch (error) {
    assert.match(error.message, /MCP timeout/, "Ошибка должна быть о таймауте");
    assert.match(error.message, /100ms/, "Ошибка должна содержать значение таймаута");
  }
});

test("SimpleHTTPTransport: close() — no-op", async (t) => {
  const transport = new SimpleHTTPTransport();
  const result = transport.close();
  assert.strictEqual(result, undefined, "close() должен возвращать undefined");
});
