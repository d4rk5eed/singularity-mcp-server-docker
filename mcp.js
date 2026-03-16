"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Файл для запуска MCP сервера Singularity
 */
const index_1 = require("./index");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
async function startMcpServer() {
    try {
        // Парсинг аргументов командной строки
        const args = process.argv.slice(2);
        // Значения по умолчанию
        let baseUrl = 'https://api.singularity-app.com';
        let accessToken = '910d5012-6c09-4190-85c3-692caf92575f';
        let enableLogging = false;
        let logLevel = 'info';
        // Обработка аргументов
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--baseUrl' || args[i] === '-u') {
                if (i + 1 < args.length) {
                    baseUrl = args[i + 1];
                    i++;
                }
            }
            else if (args[i] === '--accessToken' || args[i] === '-t') {
                if (i + 1 < args.length) {
                    accessToken = args[i + 1];
                    i++;
                }
            }
            else if (args[i] === '--noLog' || args[i] === '-n') {
                enableLogging = false;
            }
            else if (args[i] === '--logLevel' || args[i] === '-l') {
                if (i + 1 < args.length && ['debug', 'info', 'warn', 'error'].includes(args[i + 1])) {
                    logLevel = args[i + 1];
                    i++;
                }
            }
            else if (args[i] === '--help' || args[i] === '-h') {
                console.log(`
Запуск MCP сервера Singularity

Использование:
  node dist/mcp.js [опции]

Опции:
  --baseUrl, -u        URL API Singularity (по умолчанию: https://api.singularity-app.com)
  --accessToken, -t    Токен доступа для API
  --noLog, -n          Отключить логирование (по умолчанию: логирование включено)
  --logLevel, -l       Уровень логирования (debug|info|warn|error, по умолчанию: info)
  --help, -h           Показать эту справку
        `);
                process.exit(0);
            }
        }
        // console.log(`Запуск MCP сервера...`);
        // console.log(`URL API: ${baseUrl}`);
        // console.log(`Access Token: ${accessToken.substring(0, 8)}...`);
        // console.log(`Логирование: ${enableLogging ? `включено (${logLevel})` : 'отключено'}`);
        // Создание сервера с настройками
        const server = new index_1.SingularityMcpServer({
            baseUrl,
            accessToken,
            enableLogging,
            logLevel: logLevel,
        });
        // Подключение к stdio транспорту
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
        // console.log('MCP сервер успешно запущен и подключен к stdio транспорту');
        // Обработка завершения процесса
        process.on('SIGINT', () => {
            // console.log('Завершение работы MCP сервера...');
            process.exit(0);
        });
    }
    catch (error) {
        // console.error('Ошибка запуска MCP сервера:', error);
        process.exit(1);
    }
}
// Запускаем сервер
startMcpServer();
//# sourceMappingURL=mcp.js.map