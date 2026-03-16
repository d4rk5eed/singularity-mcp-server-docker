"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTimeStatResources = registerTimeStatResources;
exports.registerTimeStatTools = registerTimeStatTools;
/**
 * MCP module for Time Statistics
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers time stat resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTimeStatResources(server, apiClient) {
    server.registerResource('time-stats', 'singularity://time-stats', {
        title: 'Time Statistics',
        description: 'List of all time statistics (work sessions)',
    }, async (uri, variables, extra) => {
        try {
            const timeStats = await apiClient.listTimeStats();
            return { contents: [{ uri: 'singularity://time-stats', text: JSON.stringify(timeStats, null, 2) }] };
        }
        catch (err) {
            console.error('Error fetching time stats:', err);
            throw err;
        }
    });
    server.registerResource('time-stat', new mcp_js_1.ResourceTemplate('singularity://time-stat/{id}', { list: undefined }), {
        title: 'Time Stat',
        description: 'Time stat by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const timeStat = await apiClient.getTimeStat(id);
            return { contents: [{ uri: uri.href, text: JSON.stringify(timeStat, null, 2) }] };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching time stat ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers time stat tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTimeStatTools(server, apiClient) {
    server.registerTool('createTimeStat', {
        title: 'Create Time Stat',
        description: 'Creates a new time statistics entry (work session)',
        inputSchema: {
            timeStat: zod_1.z.object({
                start: zod_1.z.string().describe('Start date (ISO 8601 format)'),
                secondsPassed: zod_1.z.number().describe('Duration in seconds'),
                relatedTaskId: zod_1.z.string().optional().describe('Related task ID'),
                source: zod_1.z.number().optional().describe('Source type (0 = pomodoro, 1 = stopwatch)'),
            }),
        },
    }, async ({ timeStat }) => {
        try {
            const result = await apiClient.createTimeStat(timeStat);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating time stat:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('updateTimeStat', {
        title: 'Update Time Stat',
        description: 'Updates an existing time statistics entry',
        inputSchema: {
            timeStat: zod_1.z.object({
                id: zod_1.z.string(),
                start: zod_1.z.string().optional().describe('Start date (ISO 8601 format)'),
                secondsPassed: zod_1.z.number().optional().describe('Duration in seconds'),
                relatedTaskId: zod_1.z.string().optional().describe('Related task ID'),
                source: zod_1.z.number().optional().describe('Source type (0 = pomodoro, 1 = stopwatch)'),
            }),
        },
    }, async ({ timeStat }) => {
        try {
            const result = await apiClient.updateTimeStat(timeStat);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating time stat:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('deleteTimeStat', {
        title: 'Delete Time Stat',
        description: 'Deletes a time statistics entry',
        inputSchema: { id: zod_1.z.string() },
    }, async ({ id }) => {
        try {
            await apiClient.deleteTimeStat(id);
            return (0, response_1.success)({ message: `Time stat ${id} deleted` });
        }
        catch (err) {
            console.error('Error deleting time stat:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('getTimeStat', {
        title: 'Get Time Stat',
        description: 'Gets a time statistics entry by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getTimeStat(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting time stat:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('listTimeStats', {
        title: 'List Time Stats',
        description: 'Lists time statistics entries with optional filters',
        inputSchema: {
            dateFrom: zod_1.z.string().optional().describe('Filter by start date (from)'),
            dateTo: zod_1.z.string().optional().describe('Filter by start date (to)'),
            relatedTaskId: zod_1.z.string().optional().describe('Filter by related task ID'),
            maxCount: zod_1.z.number().optional().describe('Maximum number of items in response'),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listTimeStats(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing time stats:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('deleteBulkTimeStats', {
        title: 'Delete Bulk Time Stats',
        description: 'Bulk delete time statistics entries by filters',
        inputSchema: {
            dateFrom: zod_1.z.string().optional().describe('Filter by start date (from)'),
            dateTo: zod_1.z.string().optional().describe('Filter by start date (to)'),
            relatedTaskId: zod_1.z.string().optional().describe('Filter by related task ID'),
        },
    }, async (params) => {
        try {
            const result = await apiClient.deleteBulkTimeStats(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error bulk deleting time stats:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=time-stat.js.map