"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHabitResources = registerHabitResources;
exports.registerHabitTools = registerHabitTools;
/**
 * MCP module for Habits
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers habit resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerHabitResources(server, apiClient) {
    server.registerResource('habits', 'singularity://habits', {
        title: 'Habits',
        description: 'List of all habits',
    }, async (uri, variables, extra) => {
        try {
            const habits = await apiClient.listHabits();
            return { contents: [{ uri: 'singularity://habits', text: JSON.stringify(habits, null, 2) }] };
        }
        catch (err) {
            console.error('Error fetching habits:', err);
            throw err;
        }
    });
    server.registerResource('habit', new mcp_js_1.ResourceTemplate('singularity://habit/{id}', { list: undefined }), {
        title: 'Habit',
        description: 'Habit by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const habit = await apiClient.getHabit(id);
            return { contents: [{ uri: uri.href, text: JSON.stringify(habit, null, 2) }] };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching habit ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers habit tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerHabitTools(server, apiClient) {
    server.registerTool('createHabit', {
        title: 'Create Habit',
        description: 'Creates a new habit',
        inputSchema: {
            habit: zod_1.z.object({
                title: zod_1.z.string(),
                description: zod_1.z.string().optional(),
                color: zod_1.z.enum(['red', 'pink', 'purple', 'deepPurple', 'indigo', 'lightBlue', 'cyan', 'teal', 'green', 'lightGreen', 'lime', 'yellow', 'amber', 'orange', 'deepOrange', 'brown', 'grey', 'blueGrey']).optional(),
                order: zod_1.z.number().optional(),
                status: zod_1.z.number().optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ habit }) => {
        try {
            const result = await apiClient.createHabit(habit);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating habit:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('updateHabit', {
        title: 'Update Habit',
        description: 'Updates an existing habit',
        inputSchema: {
            habit: zod_1.z.object({
                id: zod_1.z.string(),
                title: zod_1.z.string().optional(),
                description: zod_1.z.string().optional(),
                color: zod_1.z.enum(['red', 'pink', 'purple', 'deepPurple', 'indigo', 'lightBlue', 'cyan', 'teal', 'green', 'lightGreen', 'lime', 'yellow', 'amber', 'orange', 'deepOrange', 'brown', 'grey', 'blueGrey']).optional(),
                order: zod_1.z.number().optional(),
                status: zod_1.z.number().optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ habit }) => {
        try {
            const result = await apiClient.updateHabit(habit);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating habit:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('deleteHabit', {
        title: 'Delete Habit',
        description: 'Deletes a habit',
        inputSchema: { id: zod_1.z.string() },
    }, async ({ id }) => {
        try {
            await apiClient.deleteHabit(id);
            return (0, response_1.success)({ message: `Habit ${id} deleted` });
        }
        catch (err) {
            console.error('Error deleting habit:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('getHabit', {
        title: 'Get Habit',
        description: 'Gets a habit by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getHabit(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting habit:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('listHabits', {
        title: 'List Habits',
        description: 'Lists all habits',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listHabits(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing habits:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=habit.js.map