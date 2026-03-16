"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = exports.SingularityMcpServer = void 0;
exports.createServer = createServer;
/**
 * Singularity MCP Server
 */
const server_1 = require("./server");
const client_1 = require("./client");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
// Export server and client
var server_2 = require("./server");
Object.defineProperty(exports, "SingularityMcpServer", { enumerable: true, get: function () { return server_2.SingularityMcpServer; } });
var client_2 = require("./client");
Object.defineProperty(exports, "ApiClient", { enumerable: true, get: function () { return client_2.ApiClient; } });
// Export types
__exportStar(require("./types"), exports);
/**
 * Creates and configures a new Singularity MCP server with stdio transport
 * @param baseUrl - API base URL
 * @param accessToken - access token (required)
 * @param enableLogging - Enable logging (optional, default: true)
 * @param logLevel - Logging level (optional, default: 'info')
 * @returns SingularityMcpServer instance
 */
async function createServer(baseUrl, accessToken, enableLogging = true, logLevel = 'info') {
    const server = new server_1.SingularityMcpServer({
        baseUrl,
        accessToken,
        enableLogging,
        logLevel,
    });
    // Connect server to stdio transport
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    return server;
}
// Default export for convenience
exports.default = {
    SingularityMcpServer: server_1.SingularityMcpServer,
    ApiClient: client_1.ApiClient,
    createServer,
};
//# sourceMappingURL=index.js.map