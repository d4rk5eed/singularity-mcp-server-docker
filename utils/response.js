"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToolResponse = formatToolResponse;
exports.success = success;
exports.error = error;
exports.checkForErrors = checkForErrors;
/**
 * Formats response content for MCP tools
 * @param content - Content to be returned
 * @param isError - Whether the content represents an error
 * @returns Formatted response
 */
function formatToolResponse(content, isError = false) {
    let text;
    if (typeof content === 'string') {
        text = content;
    }
    else {
        try {
            text = JSON.stringify(content, null, 2);
        }
        catch (error) {
            text = String(content);
        }
    }
    return {
        content: [
            {
                type: 'text',
                text,
            },
        ],
        isError,
    };
}
/**
 * Formats a successful response
 * @param data - Response data
 * @returns Formatted successful response
 */
function success(data) {
    return {
        content: [
            {
                type: 'text',
                text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
            },
        ],
        isError: false,
    };
}
/**
 * Formats an error response
 * @param error - Error message or object
 * @returns Formatted error response
 */
function error(error) {
    let errorMessage;
    if (typeof error === 'string') {
        errorMessage = error;
    }
    else if (error instanceof Error) {
        errorMessage = error.message;
    }
    else {
        errorMessage = `Error ${error.code}: ${error.message}`;
    }
    return {
        content: [
            {
                type: 'text',
                text: errorMessage,
            },
        ],
        isError: true,
    };
}
/**
 * Checks if the response contains errors
 * @param response - API response
 * @throws Error with the first error message from the response
 */
function checkForErrors(response) {
    if (response.errors && response.errors.length > 0) {
        const firstError = response.errors[0];
        throw new Error(`Error ${firstError.code}: ${firstError.message}`);
    }
    return response.data;
}
//# sourceMappingURL=response.js.map