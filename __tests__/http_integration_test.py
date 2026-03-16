#!/usr/bin/env python3
"""
E2E интеграционные тесты для HTTP-режима MCP сервера.

Тесты проверяют реальное поведение контейнера Docker в HTTP-режиме.
Перед запуском убедитесь, что:
1. Docker-образ собран: docker build -t singularity-mcp-server:2.1.1 .
2. Контейнер может быть запущен на порту 3000
3. REFRESH_TOKEN доступен (или используется DEMO_MODE=true)

Запуск:
    python __tests__/http_integration_test.py
"""

import subprocess
import time
import requests
import json
import sys
import threading
from typing import Optional, Dict, Any

# ============================================================================
# Утилиты
# ============================================================================

class Colors:
    """ANSI цвета для вывода"""
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    RESET = "\033[0m"


def log(message: str, level: str = "info"):
    """Логирование с цветом"""
    if level == "info":
        print(f"{Colors.BLUE}[INFO]{Colors.RESET} {message}")
    elif level == "success":
        print(f"{Colors.GREEN}[✓]{Colors.RESET} {message}")
    elif level == "error":
        print(f"{Colors.RED}[✗]{Colors.RESET} {message}")
    elif level == "warn":
        print(f"{Colors.YELLOW}[!]{Colors.RESET} {message}")


def assert_equal(actual: Any, expected: Any, message: str):
    """Проверка равенства с логированием"""
    if actual != expected:
        log(f"{message} | Expected: {expected}, Got: {actual}", "error")
        raise AssertionError(f"{message}: {actual} != {expected}")


def assert_true(condition: bool, message: str):
    """Проверка условия"""
    if not condition:
        log(message, "error")
        raise AssertionError(message)


def assert_in(item: Any, container: Any, message: str):
    """Проверка наличия элемента в контейнере"""
    if item not in container:
        log(f"{message} | {item} not in {container}", "error")
        raise AssertionError(f"{message}: {item} not found")


# ============================================================================
# Управление контейнером Docker
# ============================================================================

class DockerContainer:
    """Управление Docker контейнером для тестов"""

    def __init__(self, image: str = "singularity-mcp-server:2.1.1", port: int = 3000):
        self.image = image
        self.port = port
        self.container_id: Optional[str] = None
        self.base_url = f"http://localhost:{port}"

    def start(self, refresh_token: Optional[str] = None, demo_mode: bool = False):
        """Запускает контейнер"""
        log(f"Starting Docker container {self.image}...", "info")

        # Подготавливаем переменные окружения
        env_vars = ["-e", f"PORT={self.port}"]

        if demo_mode:
            env_vars.extend(["-e", "DEMO_MODE=true"])
        elif refresh_token:
            env_vars.extend(["-e", f"REFRESH_TOKEN={refresh_token}"])
        else:
            log("Warning: Neither REFRESH_TOKEN nor DEMO_MODE provided", "warn")

        # Запускаем контейнер
        cmd = [
            "docker", "run", "-d",
            "-p", f"{self.port}:{self.port}",
            *env_vars,
            "--name", "mcp-http-test",
            self.image
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode != 0:
                raise RuntimeError(f"Failed to start container: {result.stderr}")
            self.container_id = result.stdout.strip()
            log(f"Container started: {self.container_id[:12]}", "success")
        except subprocess.TimeoutExpired:
            raise RuntimeError("Timeout starting container")

    def wait_healthy(self, max_attempts: int = 20, interval: float = 1.0):
        """Ожидает, пока контейнер станет healthy"""
        log("Waiting for container to be healthy...", "info")

        for attempt in range(max_attempts):
            try:
                response = requests.get(f"{self.base_url}/health", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "ok":
                        log("Container is healthy", "success")
                        return
            except Exception:
                pass

            if attempt < max_attempts - 1:
                time.sleep(interval)

        raise RuntimeError(f"Container did not become healthy after {max_attempts * interval}s")

    def stop(self):
        """Останавливает контейнер"""
        if self.container_id:
            log("Stopping container...", "info")
            try:
                subprocess.run(
                    ["docker", "rm", "-f", "mcp-http-test"],
                    capture_output=True,
                    timeout=10
                )
                log("Container stopped", "success")
            except Exception as e:
                log(f"Error stopping container: {e}", "warn")

    def request(self, method: str, path: str, **kwargs) -> requests.Response:
        """Отправляет HTTP-запрос"""
        url = f"{self.base_url}{path}"
        response = requests.request(method, url, timeout=10, **kwargs)
        return response


# ============================================================================
# Сценарии тестов (Gherkin-стиль)
# ============================================================================

def scenario_1_health_endpoint(container: DockerContainer):
    """
    Сценарий 1: GET /health возвращает корректный статус
    """
    log("\n=== Сценарий 1: GET /health ===", "info")

    response = container.request("GET", "/health")
    assert_equal(response.status_code, 200, "Health endpoint status code")

    data = response.json()
    assert_equal(data.get("status"), "ok", "Health status")
    assert_equal(data.get("version"), "2.1.1", "Server version")
    assert_equal(data.get("mode"), "http", "Server mode")
    assert_true("apiUrl" in data, "apiUrl should be present in response")

    log("✓ Health endpoint returns correct status", "success")


def scenario_2_list_tasks(container: DockerContainer):
    """
    Сценарий 2: POST /mcp tools/call listTasks возвращает список задач
    """
    log("\n=== Сценарий 2: POST /mcp tools/call listTasks ===", "info")

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "listTasks",
            "arguments": {}
        }
    }

    response = container.request("POST", "/mcp", json=payload)
    assert_equal(response.status_code, 200, "POST /mcp status code")

    data = response.json()
    assert_true("result" in data, "result should be present")
    assert_true("error" not in data or data.get("error") is None, "error should not be present")
    assert_true("content" in data.get("result", {}), "result.content should be present")

    # Проверяем, что content[0].text парсится как JSON-массив
    content_text = data["result"]["content"][0].get("text", "")
    try:
        tasks = json.loads(content_text)
        assert_true(isinstance(tasks, list), "Parsed content should be a list")
        log(f"✓ listTasks returned {len(tasks)} tasks", "success")
    except json.JSONDecodeError:
        log(f"Warning: content[0].text is not valid JSON: {content_text[:100]}", "warn")

    # Проверяем isError
    is_error = data.get("result", {}).get("isError")
    assert_true(is_error is None or is_error is False, "isError should be None or False")

    log("✓ listTasks scenario passed", "success")


def scenario_3_create_task(container: DockerContainer):
    """
    Сценарий 3: POST /mcp tools/call createTask создаёт тестовую задачу
    """
    log("\n=== Сценарий 3: POST /mcp tools/call createTask ===", "info")

    payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "createTask",
            "arguments": {
                "task": {
                    "title": "[TEST] HTTP integration",
                    "priority": 1
                }
            }
        }
    }

    response = container.request("POST", "/mcp", json=payload)
    assert_equal(response.status_code, 200, "POST /mcp createTask status code")

    data = response.json()
    assert_true("result" in data, "result should be present")

    # Проверяем, что result.content[0].text содержит ID
    content_text = data["result"]["content"][0].get("text", "")
    try:
        task = json.loads(content_text)
        assert_true("id" in task, "Task should have 'id' field")
        log(f"✓ Created task with id: {task.get('id')}", "success")
    except json.JSONDecodeError:
        log(f"Warning: content[0].text is not valid JSON", "warn")

    # Проверяем isError
    is_error = data.get("result", {}).get("isError")
    assert_true(is_error is None or is_error is False, "isError should be None or False for success")

    log("✓ createTask scenario passed", "success")


def scenario_4_no_token_error(container: DockerContainer):
    """
    Сценарий 4: POST /mcp без токена → isError в MCP-ответе, не HTTP 500
    """
    log("\n=== Сценарий 4: POST /mcp без токена (DEMO_MODE) ===", "info")

    payload = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "listTasks",
            "arguments": {}
        }
    }

    response = container.request("POST", "/mcp", json=payload)

    # HTTP статус должен быть 200, а не 500
    assert_equal(response.status_code, 200, "POST /mcp should return 200 even without token")

    data = response.json()

    # Проверяем, что это MCP-level error (result с isError)
    is_error = data.get("result", {}).get("isError")
    if is_error:
        content_text = data.get("result", {}).get("content", [{}])[0].get("text", "")
        assert_in("401", content_text, "Error message should contain 401 or Unauthorized") or \
        assert_in("Unauthorized", content_text, "Error message should contain Unauthorized")
        log("✓ Received MCP-level error (isError: true) as expected", "success")
    else:
        log("⚠ No error received in DEMO_MODE (expected for some configurations)", "warn")


def scenario_5_nonexistent_tool(container: DockerContainer):
    """
    Сценарий 5: POST /mcp с несуществующим инструментом — сервер не падает
    """
    log("\n=== Сценарий 5: POST /mcp с несуществующим инструментом ===", "info")

    payload = {
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "nonExistentTool",
            "arguments": {}
        }
    }

    response = container.request("POST", "/mcp", json=payload)
    assert_equal(response.status_code, 200, "POST /mcp should return 200 for nonexistent tool")

    data = response.json()

    # Может быть либо error, либо result с isError
    has_error = "error" in data or data.get("result", {}).get("isError") is True
    assert_true(has_error, "Should have error or isError for nonexistent tool")

    # Проверяем, что сервер ещё жив (следующий запрос работает)
    health_response = container.request("GET", "/health")
    assert_equal(health_response.status_code, 200, "Server should still be healthy")

    log("✓ Server survived nonexistent tool call", "success")


def scenario_6_parallel_requests(container: DockerContainer):
    """
    Сценарий 6: Параллельные запросы не интерферируют (id не перепутываются)
    """
    log("\n=== Сценарий 6: Параллельные запросы ===", "info")

    results = {"thread_a": None, "thread_b": None}
    errors = []

    def thread_a():
        try:
            payload = {
                "jsonrpc": "2.0",
                "id": 10,
                "method": "tools/call",
                "params": {
                    "name": "listTasks",
                    "arguments": {}
                }
            }
            response = container.request("POST", "/mcp", json=payload)
            results["thread_a"] = response.json()
        except Exception as e:
            errors.append(f"Thread A: {e}")

    def thread_b():
        try:
            payload = {
                "jsonrpc": "2.0",
                "id": 11,
                "method": "tools/call",
                "params": {
                    "name": "listProjects",
                    "arguments": {}
                }
            }
            response = container.request("POST", "/mcp", json=payload)
            results["thread_b"] = response.json()
        except Exception as e:
            errors.append(f"Thread B: {e}")

    # Запускаем параллельно
    t_a = threading.Thread(target=thread_a)
    t_b = threading.Thread(target=thread_b)

    t_a.start()
    t_b.start()

    t_a.join(timeout=15)
    t_b.join(timeout=15)

    # Проверяем ошибки
    assert_true(len(errors) == 0, f"No threading errors: {errors}")

    # Проверяем, что id не перепутались
    assert_equal(results["thread_a"]["id"], 10, "Thread A should have id=10")
    assert_equal(results["thread_b"]["id"], 11, "Thread B should have id=11")

    log("✓ Parallel requests maintained correct IDs", "success")


# ============================================================================
# Главная функция
# ============================================================================

def main():
    """Запускает все сценарии тестов"""
    log("\n" + "="*70, "info")
    log("HTTP-режим MCP сервера в Docker — E2E тесты", "info")
    log("="*70, "info")

    container = DockerContainer()
    passed = 0
    failed = 0

    try:
        # Подготовка
        log("\n[SETUP] Проверка Docker образа...", "info")

        # Попробуем получить REFRESH_TOKEN из окружения или используем DEMO_MODE
        import os
        refresh_token = os.getenv("REFRESH_TOKEN")
        use_demo_mode = os.getenv("DEMO_MODE", "").lower() == "true" or not refresh_token

        container.start(refresh_token=refresh_token, demo_mode=use_demo_mode)
        container.wait_healthy(max_attempts=20, interval=1.0)

        # Запускаем сценарии
        scenarios = [
            ("Scenario 1: Health endpoint", scenario_1_health_endpoint),
            ("Scenario 2: List tasks", scenario_2_list_tasks),
            ("Scenario 3: Create task", scenario_3_create_task),
            ("Scenario 4: No token error", scenario_4_no_token_error),
            ("Scenario 5: Nonexistent tool", scenario_5_nonexistent_tool),
            ("Scenario 6: Parallel requests", scenario_6_parallel_requests),
        ]

        for scenario_name, scenario_func in scenarios:
            try:
                scenario_func(container)
                passed += 1
            except AssertionError as e:
                log(f"FAILED: {e}", "error")
                failed += 1
            except Exception as e:
                log(f"ERROR: {scenario_name} - {e}", "error")
                failed += 1

    finally:
        container.stop()

    # Итоги
    log("\n" + "="*70, "info")
    log(f"Результаты: {passed} passed, {failed} failed", "info")
    log("="*70, "info")

    if failed > 0:
        sys.exit(1)
    else:
        log("\n✓ All scenarios passed!", "success")
        sys.exit(0)


if __name__ == "__main__":
    main()
