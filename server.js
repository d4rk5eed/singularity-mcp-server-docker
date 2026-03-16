"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingularityMcpServer = void 0;
/**
 * MCP server for Singularity API
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const client_1 = require("./client");
const project_1 = require("./modules/project");
const task_group_1 = require("./modules/task-group");
const task_1 = require("./modules/task");
const note_1 = require("./modules/note");
const kanban_status_1 = require("./modules/kanban-status");
const kanban_task_status_1 = require("./modules/kanban-task-status");
const habit_1 = require("./modules/habit");
const habit_progress_1 = require("./modules/habit-progress");
const checklist_item_1 = require("./modules/checklist-item");
const tag_1 = require("./modules/tag");
const time_stat_1 = require("./modules/time-stat");
class SingularityMcpServer {
    /**
     * Creates a new Singularity MCP server
     * @param config - Server configuration
     */
    constructor(config) {
        // Настройка логирования
        this.enableLogging = config.enableLogging !== undefined ? config.enableLogging : true;
        this.logLevel = config.logLevel || 'info';
        this.logMessage('Инициализация', 'Создание экземпляра MCP сервера');
        this.server = new mcp_js_1.McpServer({
            name: 'singularity-mcp-server',
            version: '1.0.0',
        });
        this.logMessage('Инициализация', 'Создание API клиента');
        this.apiClient = new client_1.ApiClient({
            baseUrl: config.baseUrl,
            enableLogging: this.enableLogging,
            logLevel: this.logLevel
        });
        if (config.accessToken) {
            this.logMessage('Аутентификация', 'Установка access токена');
            this.apiClient.setAccessToken(config.accessToken);
        }
        this.logMessage('Инициализация', 'Начало регистрации ресурсов и инструментов');
        this.registerResources();
        this.registerTools();
        this.logMessage('Инициализация', 'Завершение регистрации ресурсов и инструментов');
    }
    /**
     * Логирует сообщение с указанным уровнем
     * @param category - Категория сообщения
     * @param message - Текст сообщения
     * @param data - Дополнительные данные
     */
    logMessage(category, message, data) {
        if (!this.enableLogging)
            return;
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            category,
            message,
            ...(data ? { data } : {})
        };
        const logMessage = `[${timestamp}] [${category}] ${message}${data ? ': ' + JSON.stringify(data, null, 2) : ''}`;
        switch (this.logLevel) {
            case 'debug':
                console.debug(logMessage);
                break;
            case 'info':
                console.info(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            case 'error':
                console.error(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }
    /**
     * Registers all resources
     */
    registerResources() {
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов проектов');
        (0, project_1.registerProjectResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов групп задач');
        (0, task_group_1.registerTaskGroupResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов задач');
        (0, task_1.registerTaskResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов заметок');
        (0, note_1.registerNoteResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов статусов канбан');
        (0, kanban_status_1.registerKanbanStatusResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов связей задач со статусами канбан');
        (0, kanban_task_status_1.registerKanbanTaskStatusResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов привычек');
        (0, habit_1.registerHabitResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов прогресса привычек');
        (0, habit_progress_1.registerHabitProgressResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов элементов чеклиста');
        (0, checklist_item_1.registerChecklistItemResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов тегов');
        (0, tag_1.registerTagResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Начало регистрации ресурсов статистики времени');
        (0, time_stat_1.registerTimeStatResources)(this.server, this.apiClient);
        this.logMessage('Ресурсы', 'Все ресурсы зарегистрированы');
    }
    /**
     * Registers all tools
     */
    registerTools() {
        this.logMessage('Инструменты', 'Начало регистрации инструментов проектов');
        (0, project_1.registerProjectTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов групп задач');
        (0, task_group_1.registerTaskGroupTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов задач');
        (0, task_1.registerTaskTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов заметок');
        (0, note_1.registerNoteTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов статусов канбан');
        (0, kanban_status_1.registerKanbanStatusTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов связей задач со статусами канбан');
        (0, kanban_task_status_1.registerKanbanTaskStatusTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов привычек');
        (0, habit_1.registerHabitTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов прогресса привычек');
        (0, habit_progress_1.registerHabitProgressTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов элементов чеклиста');
        (0, checklist_item_1.registerChecklistItemTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов тегов');
        (0, tag_1.registerTagTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Начало регистрации инструментов статистики времени');
        (0, time_stat_1.registerTimeStatTools)(this.server, this.apiClient);
        this.logMessage('Инструменты', 'Все инструменты зарегистрированы');
    }
    /**
     * Sets the access token for API authentication
     * @param token - JWT access token
     */
    setAccessToken(token) {
        this.logMessage('Аутентификация', 'Обновление access токена');
        this.apiClient.setAccessToken(token);
    }
    /**
     * Gets the MCP server instance
     * @returns MCP server instance
     */
    getServer() {
        return this.server;
    }
    /**
     * Connects the server to a transport
     * @param transport - Server transport
     */
    async connect(transport) {
        this.logMessage('Подключение', 'Начало подключения к транспорту');
        try {
            await this.server.connect(transport);
            this.logMessage('Подключение', 'Сервер успешно подключен к транспорту');
        }
        catch (error) {
            this.logMessage('Ошибка', 'Не удалось подключиться к транспорту', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    /**
     * Включает или отключает логирование
     * @param enable - Включить или выключить логирование
     */
    setLogging(enable) {
        this.enableLogging = enable;
        this.apiClient.setLogging(enable);
        this.logMessage('Конфигурация', `Логирование ${enable ? 'включено' : 'отключено'}`);
    }
    /**
     * Устанавливает уровень логирования
     * @param level - Уровень логирования
     */
    setLogLevel(level) {
        this.logLevel = level;
        this.apiClient.setLogLevel(level);
        this.logMessage('Конфигурация', `Установлен уровень логирования: ${level}`);
    }
}
exports.SingularityMcpServer = SingularityMcpServer;
//# sourceMappingURL=server.js.map