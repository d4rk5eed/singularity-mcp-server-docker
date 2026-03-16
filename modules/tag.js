"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTagResources = registerTagResources;
exports.registerTagTools = registerTagTools;
/**
 * MCP module for Tags
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers tag resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTagResources(server, apiClient) {
    server.registerResource('tags', 'singularity://tags', {
        title: 'Tags',
        description: 'List of all tags',
    }, async (uri, variables, extra) => {
        try {
            const tags = await apiClient.listTags();
            return { contents: [{ uri: 'singularity://tags', text: JSON.stringify(tags, null, 2) }] };
        }
        catch (err) {
            console.error('Error fetching tags:', err);
            throw err;
        }
    });
    server.registerResource('tag', new mcp_js_1.ResourceTemplate('singularity://tag/{id}', { list: undefined }), {
        title: 'Tag',
        description: 'Tag by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const tag = await apiClient.getTag(id);
            return { contents: [{ uri: uri.href, text: JSON.stringify(tag, null, 2) }] };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching tag ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers tag tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTagTools(server, apiClient) {
    server.registerTool('createTag', {
        title: 'Create Tag',
        description: 'Creates a new tag',
        inputSchema: {
            tag: zod_1.z.object({
                title: zod_1.z.string(),
                externalId: zod_1.z.string(),
                hotkey: zod_1.z.number(),
                parent: zod_1.z.string(),
                parentOrder: zod_1.z.number(),
                color: zod_1.z.string(),
            }),
        },
    }, async ({ tag }) => {
        try {
            const result = await apiClient.createTag(tag);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating tag:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('updateTag', {
        title: 'Update Tag',
        description: 'Updates an existing tag',
        inputSchema: {
            tag: zod_1.z.object({
                id: zod_1.z.string(),
                title: zod_1.z.string().optional(),
                externalId: zod_1.z.string().optional(),
                hotkey: zod_1.z.number().optional(),
                parent: zod_1.z.string().optional(),
                parentOrder: zod_1.z.number().optional(),
                color: zod_1.z.string().optional(),
            }),
        },
    }, async ({ tag }) => {
        try {
            const result = await apiClient.updateTag(tag);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating tag:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('deleteTag', {
        title: 'Delete Tag',
        description: 'Deletes a tag',
        inputSchema: { id: zod_1.z.string() },
    }, async ({ id }) => {
        try {
            await apiClient.deleteTag(id);
            return (0, response_1.success)({ message: `Tag ${id} deleted` });
        }
        catch (err) {
            console.error('Error deleting tag:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('listTags', {
        title: 'List Tags',
        description: 'Lists all tags',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            parent: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listTags(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing tags:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    server.registerTool('getTag', {
        title: 'Get Tag',
        description: 'Gets a tag by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getTag(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting tag:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=tag.js.map