"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaskResources = registerTaskResources;
exports.registerTaskTools = registerTaskTools;
/**
 * MCP module for Tasks
 */
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
/**
 * Registers task resources with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTaskResources(server, apiClient) {
    // Register tasks resource list
    server.registerResource('tasks', 'singularity://tasks', {
        title: 'Tasks',
        description: 'List of all available tasks',
    }, async (uri, extra) => {
        try {
            const tasks = await apiClient.listTasks();
            return {
                contents: [{
                        uri: 'singularity://tasks',
                        text: JSON.stringify(tasks, null, 2),
                    }]
            };
        }
        catch (err) {
            console.error('Error fetching tasks:', err);
            throw err;
        }
    });
    // Register project tasks resource list
    server.registerResource('projectTasks', new mcp_js_1.ResourceTemplate('singularity://project/{projectId}/tasks', {
        list: undefined,
    }), {
        title: 'Project Tasks',
        description: 'List of tasks for a specific project',
    }, async (uri, variables, extra) => {
        try {
            const projectId = Array.isArray(variables.projectId) ? variables.projectId[0] : variables.projectId;
            const tasks = await apiClient.listTasks({ projectId });
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(tasks, null, 2),
                    }]
            };
        }
        catch (err) {
            const projectId = Array.isArray(variables.projectId) ? variables.projectId[0] : variables.projectId;
            console.error(`Error fetching tasks for project ${projectId}:`, err);
            throw err;
        }
    });
    // Register task resource by ID
    server.registerResource('task', new mcp_js_1.ResourceTemplate('singularity://task/{id}', {
        list: undefined,
    }), {
        title: 'Task',
        description: 'Task details by ID',
    }, async (uri, variables, extra) => {
        try {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            const task = await apiClient.getTask(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(task, null, 2),
                    }]
            };
        }
        catch (err) {
            const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
            console.error(`Error fetching task ${id}:`, err);
            throw err;
        }
    });
}
/**
 * Registers task tools with MCP server
 * @param server - MCP server instance
 * @param apiClient - API client instance
 */
function registerTaskTools(server, apiClient) {
    // Register create task tool
    server.registerTool('createTask', {
        title: 'Create Task',
        description: 'Creates a new task',
        inputSchema: {
            task: zod_1.z.object({
                title: zod_1.z.string(),
                note: zod_1.z.string().optional(),
                priority: zod_1.z.number().optional(),
                recurrence: zod_1.z.any().optional(),
                journalDate: zod_1.z.string().optional(),
                complete: zod_1.z.number().optional(),
                completeLast: zod_1.z.string().optional(),
                state: zod_1.z.number().optional(),
                checked: zod_1.z.number().optional(),
                showInBasket: zod_1.z.boolean().optional(),
                projectId: zod_1.z.string().optional(),
                start: zod_1.z.string().optional(),
                startNotifiesReaded: zod_1.z.array(zod_1.z.number()).optional(),
                notifies: zod_1.z.array(zod_1.z.number()).optional(),
                useTime: zod_1.z.boolean().optional(),
                deferred: zod_1.z.boolean().optional(),
                deadline: zod_1.z.string().optional(),
                deadlineNotifyReaded: zod_1.z.boolean().optional(),
                parent: zod_1.z.string().optional(),
                group: zod_1.z.string().optional(),
                scheduleOrder: zod_1.z.number().optional(),
                parentOrder: zod_1.z.number().optional(),
                timeLength: zod_1.z.number().optional(),
                isNote: zod_1.z.boolean().optional(),
                tags: zod_1.z.array(zod_1.z.string()).optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ task }) => {
        try {
            const result = await apiClient.createTask(task);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error creating task:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register update task tool
    server.registerTool('updateTask', {
        title: 'Update Task',
        description: 'Updates an existing task',
        inputSchema: {
            task: zod_1.z.object({
                id: zod_1.z.string(),
                title: zod_1.z.string().optional(),
                note: zod_1.z.string().optional(),
                priority: zod_1.z.number().optional(),
                recurrence: zod_1.z.any().optional(),
                journalDate: zod_1.z.string().optional(),
                complete: zod_1.z.number().optional(),
                completeLast: zod_1.z.string().optional(),
                state: zod_1.z.number().optional(),
                checked: zod_1.z.number().optional(),
                showInBasket: zod_1.z.boolean().optional(),
                projectId: zod_1.z.string().optional(),
                start: zod_1.z.string().optional(),
                startNotifiesReaded: zod_1.z.array(zod_1.z.number()).optional(),
                notifies: zod_1.z.array(zod_1.z.number()).optional(),
                useTime: zod_1.z.boolean().optional(),
                deferred: zod_1.z.boolean().optional(),
                deadline: zod_1.z.string().optional(),
                deadlineNotifyReaded: zod_1.z.boolean().optional(),
                parent: zod_1.z.string().optional(),
                group: zod_1.z.string().optional(),
                scheduleOrder: zod_1.z.number().optional(),
                parentOrder: zod_1.z.number().optional(),
                timeLength: zod_1.z.number().optional(),
                isNote: zod_1.z.boolean().optional(),
                tags: zod_1.z.array(zod_1.z.string()).optional(),
                externalId: zod_1.z.string().optional(),
            }),
        },
    }, async ({ task }) => {
        try {
            const result = await apiClient.updateTask(task);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error updating task:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register delete task tool
    server.registerTool('deleteTask', {
        title: 'Delete Task',
        description: 'Deletes a task',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            await apiClient.deleteTask(id);
            return (0, response_1.success)({ message: `Task ${id} successfully deleted` });
        }
        catch (err) {
            console.error('Error deleting task:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register get task tool
    server.registerTool('getTask', {
        title: 'Get Task',
        description: 'Gets a task by ID',
        inputSchema: {
            id: zod_1.z.string(),
        },
    }, async ({ id }) => {
        try {
            const result = await apiClient.getTask(id);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error getting task:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
    // Register list tasks tool
    server.registerTool('listTasks', {
        title: 'List Tasks',
        description: 'Lists all tasks',
        inputSchema: {
            includeRemoved: zod_1.z.boolean().optional(),
            includeArchived: zod_1.z.boolean().optional(),
            maxCount: zod_1.z.number().optional(),
            projectId: zod_1.z.string().optional(),
            parent: zod_1.z.string().optional(),
            includeAllRecurrenceInstances: zod_1.z.boolean().optional(),
            startDateFrom: zod_1.z.string().optional(),
            startDateTo: zod_1.z.string().optional(),
        },
    }, async (params) => {
        try {
            const result = await apiClient.listTasks(params);
            return (0, response_1.success)(result);
        }
        catch (err) {
            console.error('Error listing tasks:', err);
            return (0, response_1.error)(err instanceof Error ? err : String(err));
        }
    });
}
//# sourceMappingURL=task.js.map