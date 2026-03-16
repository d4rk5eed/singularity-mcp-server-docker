"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerKanbanTaskStatusResources = registerKanbanTaskStatusResources;
exports.registerKanbanTaskStatusTools = registerKanbanTaskStatusTools;
/**
 * MCP module for Kanban Task Statuses
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers kanban task status resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerKanbanTaskStatusResources(server, apiClient) {
    // Register kanban task status resource list
    server.registerResource('kanban-task-statuses', 'singularity://kanban-task-statuses', {
        title: 'Kanban Task Statuses',
        description: 'List of all available kanban task statuses',
    }, async (uri, extra) => {
        try {
            const kanbanTaskStatuses = await apiClient.listKanbanTaskStatuses();
            return {
                contents: [{
                        uri: 'singularity://kanban-task-statuses',
                        text: JSON.stringify(kanbanTaskStatuses, null, 2),
                    }]
            };
        }
        catch (err) {
            console.error('Error fetching kanban task statuses:', err);
            throw err;
        }
    });
    // Register kanban task status resource by ID
    server.registerResource('kanban-task-status', new mcp_js_1.ResourceTemplate('singularity://kanban-task-status/{id}', {
        list: undefined,
    }), {
        title: 'Kanban Task Status',
        description: 'Kanban task status details by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const kanbanTaskStatus = await apiClient.getKanbanTaskStatus(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(kanbanTaskStatus, null, 2),
                    }]
            };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching kanban task status ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers kanban task status tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerKanbanTaskStatusTools(server, apiClient) {
    // Register create kanban task status tool
    server.registerTool('createKanbanTaskStatus', {
        title: 'Create Kanban Task Status',
        description: 'Creates a new kanban task status',
        inputSchema: {
            kanbanTaskStatus: zod_1.z.object({
                taskId: zod_1.z.string(),
                statusId: zod_1.z.string(),
                kanbanOrder: zod_1.z.number().optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ kanbanTaskStatus }) => {
        try {
            const result = await apiClient.createKanbanTaskStatus(kanbanTaskStatus);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating kanban task status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register update kanban task status tool
    server.registerTool('updateKanbanTaskStatus', {
        title: 'Update Kanban Task Status',
        description: 'Updates an existing kanban task status',
        inputSchema: {
            kanbanTaskStatus: zod_1.z.object({
                id: zod_1.z.string(),
                taskId: zod_1.z.string().optional(),
                statusId: zod_1.z.string().optional(),
                kanbanOrder: zod_1.z.number().optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ kanbanTaskStatus }) => {
        try {
            const result = await apiClient.updateKanbanTaskStatus(kanbanTaskStatus);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating kanban task status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register delete kanban task status tool
    server.registerTool('deleteKanbanTaskStatus', {
        title: 'Delete Kanban Task Status',
        description: 'Deletes a kanban task status',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            await apiClient.deleteKanbanTaskStatus(id);
            return (0, response_1.success)({ message: `Kanban task status ${id} successfully deleted` });
        }
        catch (err) {
            console.error('Error deleting kanban task status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register get kanban task status tool
    server.registerTool('getKanbanTaskStatus', {
        title: 'Get Kanban Task Status',
        description: 'Gets a kanban task status by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getKanbanTaskStatus(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting kanban task status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register list kanban task statuses tool
    server.registerTool('listKanbanTaskStatuses', {
        title: 'List Kanban Task Statuses',
        description: 'Lists all kanban task statuses',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            taskId: zod_1.z.string().optional(),
            statusId: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listKanbanTaskStatuses(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing kanban task statuses:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=kanban-task-status.js.map