"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaskGroupResources = registerTaskGroupResources;
exports.registerTaskGroupTools = registerTaskGroupTools;
/**
 * MCP module for Task Groups
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers task group resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTaskGroupResources(server, apiClient) {
    // Register task groups resource list
    server.registerResource('taskGroups', 'singularity://task-groups', {
        title: 'Task Groups',
        description: 'List of all available task groups',
    }, async (uri, extra) => {
        try {
            const taskGroups = await apiClient.listTaskGroups();
            return {
                contents: [{
                        uri: 'singularity://task-groups',
                        text: JSON.stringify(taskGroups, null, 2),
                    }]
            };
        }
        catch (err) {
            console.error('Error fetching task groups:', err);
            throw err;
        }
    });
    // Register task group resource by ID
    server.registerResource('taskGroup', new mcp_js_1.ResourceTemplate('singularity://task-group/{id}', {
        list: undefined,
    }), {
        title: 'Task Group',
        description: 'Task group details by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const taskGroup = await apiClient.getTaskGroup(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(taskGroup, null, 2),
                    }]
            };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching task group ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers task group tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTaskGroupTools(server, apiClient) {
    // Register create task group tool
    server.registerTool('createTaskGroup', {
        title: 'Create Task Group',
        description: 'Creates a new task group',
        inputSchema: {
            taskGroup: zod_1.z.object({
                title: zod_1.z.string(),
                externalId: zod_1.z.string().optional(),
                parent: zod_1.z.string(),
                parentOrder: zod_1.z.number().optional(),
                fake: zod_1.z.boolean().optional(),
            }),
        },
    }, async ({ taskGroup }) => {
        try {
            const result = await apiClient.createTaskGroup(taskGroup);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating task group:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register update task group tool
    server.registerTool('updateTaskGroup', {
        title: 'Update Task Group',
        description: 'Updates an existing task group',
        inputSchema: {
            taskGroup: zod_1.z.object({
                id: zod_1.z.string(),
                title: zod_1.z.string().optional(),
                externalId: zod_1.z.string().optional(),
                parent: zod_1.z.string().optional(),
                parentOrder: zod_1.z.number().optional(),
                fake: zod_1.z.boolean().optional(),
            }),
        },
    }, async ({ taskGroup }) => {
        try {
            const result = await apiClient.updateTaskGroup(taskGroup);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating task group:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register delete task group tool
    server.registerTool('deleteTaskGroup', {
        title: 'Delete Task Group',
        description: 'Deletes a task group',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            await apiClient.deleteTaskGroup(id);
            return (0, response_1.success)({ message: `Task group ${id} successfully deleted` });
        }
        catch (err) {
            console.error('Error deleting task group:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register get task group tool
    server.registerTool('getTaskGroup', {
        title: 'Get Task Group',
        description: 'Gets a task group by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getTaskGroup(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting task group:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register list task groups tool
    server.registerTool('listTaskGroups', {
        title: 'List Task Groups',
        description: 'Lists all task groups',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            parent: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listTaskGroups(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing task groups:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=task-group.js.map