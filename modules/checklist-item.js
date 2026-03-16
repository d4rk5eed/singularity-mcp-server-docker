"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChecklistItemResources = registerChecklistItemResources;
exports.registerChecklistItemTools = registerChecklistItemTools;
/**
 * MCP module for Checklist Items
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers checklist item resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerChecklistItemResources(server, apiClient) {
    server.registerResource('checklistItems', 'singularity://checklist-items', {
        title: 'Checklist Items',
        description: 'List of all checklist items',
    }, async (uri, variables, extra) => {
        try {
            const items = await apiClient.listChecklistItems();
            return { contents: [{ uri: 'singularity://checklist-items', text: JSON.stringify(items, null, 2) }] };
        }
        catch (err) {
            console.error('Error fetching checklist items:', err);
            throw err;
        }
    });
    server.registerResource('checklistItem', new mcp_js_1.ResourceTemplate('singularity://checklist-item/{id}', { list: undefined }), {
        title: 'Checklist Item',
        description: 'Checklist item by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const item = await apiClient.getChecklistItem(id);
            return { contents: [{ uri: uri.href, text: JSON.stringify(item, null, 2) }] };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching checklist item ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers checklist item tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerChecklistItemTools(server, apiClient) {
    server.registerTool('createChecklistItem', {
        title: 'Create Checklist Item',
        description: 'Creates a new checklist item',
        inputSchema: {
            item: zod_1.z.object({
                parent: zod_1.z.string(),
                title: zod_1.z.string(),
                done: zod_1.z.boolean().optional(),
                crypted: zod_1.z.string().optional(),
                parentOrder: zod_1.z.number().optional(),
            }),
        },
    }, async ({ item }) => {
        try {
            const result = await apiClient.createChecklistItem(item);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating checklist item:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('updateChecklistItem', {
        title: 'Update Checklist Item',
        description: 'Updates an existing checklist item',
        inputSchema: {
            item: zod_1.z.object({
                id: zod_1.z.string(),
                parent: zod_1.z.string().optional(),
                title: zod_1.z.string().optional(),
                done: zod_1.z.boolean().optional(),
                crypted: zod_1.z.string().optional(),
                parentOrder: zod_1.z.number().optional(),
            }),
        },
    }, async ({ item }) => {
        try {
            const result = await apiClient.updateChecklistItem(item);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating checklist item:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('deleteChecklistItem', {
        title: 'Delete Checklist Item',
        description: 'Deletes a checklist item',
        inputSchema: { id: zod_1.z.string() },
    }, async ({ id }) => {
        try {
            await apiClient.deleteChecklistItem(id);
            return (0, response_1.success)({ message: `Checklist item ${id} deleted` });
        }
        catch (err) {
            console.error('Error deleting checklist item:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('getChecklistItem', {
        title: 'Get Checklist Item',
        description: 'Gets a checklist item by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getChecklistItem(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting checklist item:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('listChecklistItems', {
        title: 'List Checklist Items',
        description: 'Lists all checklist items',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            parent: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listChecklistItems(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing checklist items:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=checklist-item.js.map