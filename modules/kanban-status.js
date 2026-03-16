"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerKanbanStatusResources = registerKanbanStatusResources;
exports.registerKanbanStatusTools = registerKanbanStatusTools;
/**
 * MCP module for Kanban Statuses
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers kanban status resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerKanbanStatusResources(server, apiClient) {
    // Register kanban status resource list
    server.registerResource('kanban-statuses', 'singularity://kanban-statuses', {
        title: 'Kanban Statuses',
        description: 'List of all available kanban statuses',
    }, async (uri, extra) => {
        try {
            const kanbanStatuses = await apiClient.listKanbanStatuses();
            return {
                contents: [{
                        uri: 'singularity://kanban-statuses',
                        text: JSON.stringify(kanbanStatuses, null, 2),
                    }]
            };
        }
        catch (err) {
            console.error('Error fetching kanban statuses:', err);
            throw err;
        }
    });
    // Register kanban status resource by ID
    server.registerResource('kanban-status', new mcp_js_1.ResourceTemplate('singularity://kanban-status/{id}', {
        list: undefined,
    }), {
        title: 'Kanban Status',
        description: 'Kanban status details by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const kanbanStatus = await apiClient.getKanbanStatus(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(kanbanStatus, null, 2),
                    }]
            };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching kanban status ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers kanban status tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerKanbanStatusTools(server, apiClient) {
    // Register create kanban status tool
    server.registerTool('createKanbanStatus', {
        title: 'Create Kanban Status',
        description: 'Creates a new kanban status',
        inputSchema: {
            kanbanStatus: zod_1.z.object({
                name: zod_1.z.string(),
                projectId: zod_1.z.string(),
                kanbanOrder: zod_1.z.number().optional(),
                numberOfColumns: zod_1.z.number().optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ kanbanStatus }) => {
        try {
            const result = await apiClient.createKanbanStatus(kanbanStatus);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating kanban status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register update kanban status tool
    server.registerTool('updateKanbanStatus', {
        title: 'Update Kanban Status',
        description: 'Updates an existing kanban status',
        inputSchema: {
            kanbanStatus: zod_1.z.object({
                id: zod_1.z.string(),
                name: zod_1.z.string().optional(),
                projectId: zod_1.z.string().optional(),
                kanbanOrder: zod_1.z.number().optional(),
                numberOfColumns: zod_1.z.number().optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ kanbanStatus }) => {
        try {
            const result = await apiClient.updateKanbanStatus(kanbanStatus);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating kanban status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register delete kanban status tool
    server.registerTool('deleteKanbanStatus', {
        title: 'Delete Kanban Status',
        description: 'Deletes a kanban status',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            await apiClient.deleteKanbanStatus(id);
            return (0, response_1.success)({ message: `Kanban status ${id} successfully deleted` });
        }
        catch (err) {
            console.error('Error deleting kanban status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register get kanban status tool
    server.registerTool('getKanbanStatus', {
        title: 'Get Kanban Status',
        description: 'Gets a kanban status by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getKanbanStatus(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting kanban status:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register list kanban statuses tool
    server.registerTool('listKanbanStatuses', {
        title: 'List Kanban Statuses',
        description: 'Lists all kanban statuses',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            projectId: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listKanbanStatuses(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing kanban statuses:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=kanban-status.js.map