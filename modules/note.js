"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNoteResources = registerNoteResources;
exports.registerNoteTools = registerNoteTools;
/**
 * MCP module for Notes
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers note resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerNoteResources(server, apiClient) {
    // Register notes resource list
    server.registerResource('notes', 'singularity://notes', {
        title: 'Notes',
        description: 'List of all available notes',
    }, async (uri, extra) => {
        try {
            const notes = await apiClient.listNotes();
            return {
                contents: [{
                        uri: 'singularity://notes',
                        text: JSON.stringify(notes, null, 2),
                    }]
            };
        }
        catch (err) {
            console.error('Error fetching notes:', err);
            throw err;
        }
    });
    // Register container notes resource list
    server.registerResource('containerNotes', new mcp_js_1.ResourceTemplate('singularity://container/{containerId}/notes', {
        list: undefined,
    }), {
        title: 'Container Notes',
        description: 'List of notes for a specific container',
    }, async (uri, variables, extra) => {
        try {
            const containerId = Array.isArray(variables.containerId) ? variables.containerId[0] : variables.containerId;
            const notes = await apiClient.listNotes({ containerId });
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(notes, null, 2),
                    }]
            };
        }
        catch (err) {
            const containerId = Array.isArray(variables.containerId) ? variables.containerId[0] : variables.containerId;
            console.error(`Error fetching notes for container ${containerId}:`, err);
            throw err;
        }
    });
    // Register note resource by ID
    server.registerResource('note', new mcp_js_1.ResourceTemplate('singularity://note/{id}', {
        list: undefined,
    }), {
        title: 'Note',
        description: 'Note details by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const note = await apiClient.getNote(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(note, null, 2),
                    }]
            };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching note ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers note tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerNoteTools(server, apiClient) {
    // Register create note tool
    server.registerTool('createNote', {
        title: 'Create Note',
        description: 'Creates a new note',
        inputSchema: {
            note: zod_1.z.object({
                containerId: zod_1.z.string(),
                content: zod_1.z.string(),
            }),
        },
    }, async ({ note }) => {
        try {
            const result = await apiClient.createNote(note);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating note:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register update note tool
    server.registerTool('updateNote', {
        title: 'Update Note',
        description: 'Updates an existing note',
        inputSchema: {
            note: zod_1.z.object({
                id: zod_1.z.string(),
                containerId: zod_1.z.string(),
                content: zod_1.z.string(),
            }),
        },
    }, async ({ note }) => {
        try {
            const result = await apiClient.updateNote(note);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating note:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register delete note tool
    server.registerTool('deleteNote', {
        title: 'Delete Note',
        description: 'Deletes a note',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            await apiClient.deleteNote(id);
            return (0, response_1.success)({ message: `Note ${id} successfully deleted` });
        }
        catch (err) {
            console.error('Error deleting note:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register get note tool
    server.registerTool('getNote', {
        title: 'Get Note',
        description: 'Gets a note by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getNote(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting note:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register list notes tool
    server.registerTool('listNotes', {
        title: 'List Notes',
        description: 'Lists all notes',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            containerId: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listNotes(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing notes:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=note.js.map