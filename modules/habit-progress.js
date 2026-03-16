"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHabitProgressResources = registerHabitProgressResources;
exports.registerHabitProgressTools = registerHabitProgressTools;
/**
 * MCP module for Habit Progress
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers habit progress resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerHabitProgressResources(server, apiClient) {
    server.registerResource('habitProgressRecords', 'singularity://habit-progress', {
        title: 'Habit Progress Records',
        description: 'List of all habit progress records',
    }, async (uri, variables, extra) => {
        try {
            const progress = await apiClient.listHabitDailyProgress();
            return { contents: [{ uri: 'singularity://habit-progress', text: JSON.stringify(progress, null, 2) }] };
        }
        catch (err) {
            console.error('Error fetching habit progress records:', err);
            throw err;
        }
    });
    server.registerResource('habitProgress', new mcp_js_1.ResourceTemplate('singularity://habit-progress/{id}', { list: undefined }), {
        title: 'Habit Progress',
        description: 'Habit progress by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const progress = await apiClient.getHabitDailyProgress(id);
            return { contents: [{ uri: uri.href, text: JSON.stringify(progress, null, 2) }] };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching habit progress ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers habit progress tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerHabitProgressTools(server, apiClient) {
    server.registerTool('createHabitProgress', {
        title: 'Create Habit Progress',
        description: 'Creates a new habit progress record',
        inputSchema: {
            progress: zod_1.z.object({
                habit: zod_1.z.string(),
                date: zod_1.z.string(),
                progress: zod_1.z.number(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ progress }) => {
        try {
            const result = await apiClient.createHabitDailyProgress(progress);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating habit progress:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('updateHabitProgress', {
        title: 'Update Habit Progress',
        description: 'Updates an existing habit progress record',
        inputSchema: {
            progress: zod_1.z.object({
                id: zod_1.z.string(),
                habit: zod_1.z.string().optional(),
                date: zod_1.z.string().optional(),
                progress: zod_1.z.number().optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ progress }) => {
        try {
            const result = await apiClient.updateHabitDailyProgress(progress);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating habit progress:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('deleteHabitProgress', {
        title: 'Delete Habit Progress',
        description: 'Deletes a habit progress record',
        inputSchema: { id: zod_1.z.string() },
    }, async ({ id }) => {
        try {
            await apiClient.deleteHabitDailyProgress(id);
            return (0, response_1.success)({ message: `Habit progress ${id} deleted` });
        }
        catch (err) {
            console.error('Error deleting habit progress:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('getHabitProgress', {
        title: 'Get Habit Progress',
        description: 'Gets a habit progress record by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getHabitDailyProgress(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting habit progress:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('listHabitProgress', {
        title: 'List Habit Progress',
        description: 'Lists all habit progress records',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            habit: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listHabitDailyProgress(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing habit progress:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=habit-progress.js.map