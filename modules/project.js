"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProjectResources = registerProjectResources;
exports.registerProjectTools = registerProjectTools;
/**
 * MCP module for Projects
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers project resources and tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerProjectResources(server, apiClient) {
    // Register project resource list
    server.registerResource('projects', 'singularity://projects', {
        title: 'Projects',
        description: 'List of all available projects',
    }, async (uri, extra) => {
        try {
            const projects = await apiClient.listProjects();
            return {
                contents: [{
                        uri: 'singularity://projects',
                        text: JSON.stringify(projects, null, 2),
                    }]
            };
        }
        catch (err) {
            console.error('Error fetching projects:', err);
            throw err;
        }
    });
    // Register project resource by ID
    server.registerResource('project', new mcp_js_1.ResourceTemplate('singularity://project/{id}', {
        list: undefined,
    }), {
        title: 'Project',
        description: 'Project details by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const project = await apiClient.getProject(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(project, null, 2),
                    }]
            };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching project ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers project tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerProjectTools(server, apiClient) {
    // Register create project tool
    server.registerTool('createProject', {
        title: 'Create Project',
        description: 'Creates a new project',
        inputSchema: {
            project: zod_1.z.object({
                title: zod_1.z.string(),
                note: zod_1.z.string().optional(),
                start: zod_1.z.string().optional(),
                end: zod_1.z.string().optional(),
                deleteDate: zod_1.z.string().optional(),
                showInBasket: zod_1.z.boolean().optional(),
                emoji: zod_1.z.string().optional(),
                color: zod_1.z.string().optional(),
                externalId: zod_1.z.string().optional(),
                reviewValidationDate: zod_1.z.string().optional(),
                reviewValidationInterval: zod_1.z.number().optional(),
                parent: zod_1.z.string().optional(),
                parentOrder: zod_1.z.number().optional(),
                isNotebook: zod_1.z.boolean().optional(),
                tags: zod_1.z.array(zod_1.z.string()).optional(),
                journalDate: zod_1.z.string().optional(),
            }),
        },
    }, async ({ project }) => {
        try {
            const result = await apiClient.createProject(project);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating project:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register update project tool
    server.registerTool('updateProject', {
        title: 'Update Project',
        description: 'Updates an existing project',
        inputSchema: {
            project: zod_1.z.object({
                id: zod_1.z.string(),
                title: zod_1.z.string().optional(),
                note: zod_1.z.string().optional(),
                start: zod_1.z.string().optional(),
                end: zod_1.z.string().optional(),
                showInBasket: zod_1.z.boolean().optional(),
                emoji: zod_1.z.string().optional(),
                color: zod_1.z.string().optional(),
                externalId: zod_1.z.string().optional(),
                reviewValidationDate: zod_1.z.string().optional(),
                reviewValidationInterval: zod_1.z.number().optional(),
                parent: zod_1.z.string().optional(),
                parentOrder: zod_1.z.number().optional(),
                isNotebook: zod_1.z.boolean().optional(),
                tags: zod_1.z.array(zod_1.z.string()).optional(),
                deleteDate: zod_1.z.string().optional(),
                journalDate: zod_1.z.string().optional(),
            }),
        },
    }, async ({ project }) => {
        try {
            const result = await apiClient.updateProject(project);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating project:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register delete project tool
    server.registerTool('deleteProject', {
        title: 'Delete Project',
        description: 'Deletes a project',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            await apiClient.deleteProject(id);
            return (0, response_1.success)({ message: `Project ${id} successfully deleted` });
        }
        catch (err) {
            console.error('Error deleting project:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register get project tool
    server.registerTool('getProject', {
        title: 'Get Project',
        description: 'Gets a project by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getProject(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting project:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register list projects tool
    server.registerTool('listProjects', {
        title: 'List Projects',
        description: 'Lists all projects',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            includeArchived: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listProjects(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing projects:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=project.js.map