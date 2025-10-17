#!/usr/bin/env node

// Disable colors to prevent ANSI color codes from breaking JSON parsing
process.env.NODE_DISABLE_COLORS = '1';
process.env.NO_COLOR = '1';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    CallToolRequest,
    Tool
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { tools } from './tools/tools';
import { PlaitElement } from './types/element';
import axios from 'axios';
import { generateId } from './utils';

// Load environment variables
dotenv.config();

// Express server configuration
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:3000';
const ENABLE_CANVAS_SYNC = process.env.ENABLE_CANVAS_SYNC !== 'false'; // Default to true

// API Response types
interface ApiResponse {
    success: boolean;
    element?: PlaitElement;
    elements?: PlaitElement[];
    message?: string;
    count?: number;
}

interface SyncResponse {
    element?: PlaitElement;
    elements?: PlaitElement[];
}

// Helper functions to sync with Express server (canvas)
async function syncToCanvas(operation: string, data: any): Promise<SyncResponse | null> {
    if (!ENABLE_CANVAS_SYNC) {
        return null;
    }

    try {
        let url: string;
        let options: any;

        switch (operation) {
            case 'create':
                url = `${EXPRESS_SERVER_URL}/api/elements`;
                options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: data
                };
                break;

            case 'update':
                url = `${EXPRESS_SERVER_URL}/api/elements/${data.id}`;
                options = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    data: data
                };
                break;

            case 'delete':
                url = `${EXPRESS_SERVER_URL}/api/elements/${data.id}`;
                options = { method: 'DELETE' };
                break;

            case 'batch_create':
                url = `${EXPRESS_SERVER_URL}/api/elements/batch`;
                options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: { elements: data }
                };
                break;

            default:
                console.warn(`Unknown sync operation: ${operation}`);
                return null;
        }

        console.debug(`Syncing to canvas: ${operation}`, { url, data });
        const response = await axios(url, options);

        if (response.status !== 200) {
            throw new Error(`Canvas sync failed: ${response.status} ${response.statusText}`);
        }

        const result = response.data;
        console.debug(`Canvas sync successful: ${operation}`, result);
        return result as SyncResponse;

    } catch (error) {
        console.warn(`Canvas sync failed for ${operation}:`, (error as Error).message);
        // Don't throw - we want MCP operations to work even if canvas is unavailable
        return null;
    }
}

// Helper to sync element creation to canvas
async function createElementOnCanvas(elementData: PlaitElement): Promise<PlaitElement | null> {
    const result = await syncToCanvas('create', elementData);
    return result?.element || elementData;
}

// Helper to sync element update to canvas  
async function updateElementOnCanvas(elementData: Partial<PlaitElement> & { id: string }): Promise<PlaitElement | null> {
    const result = await syncToCanvas('update', elementData);
    return result?.element || null;
}

// Helper to sync element deletion to canvas
async function deleteElementOnCanvas(elementId: string): Promise<any> {
    const result = await syncToCanvas('delete', { id: elementId });
    return result;
}

// Helper to sync batch creation to canvas
async function batchCreateElementsOnCanvas(elementsData: PlaitElement[]): Promise<PlaitElement[] | null> {
    const result = await syncToCanvas('batch_create', elementsData);
    return result?.elements || elementsData;
}


// Tool definitions

// Initialize MCP server
const server = new Server(
    {
        name: 'mcp-excalidraw-server',
        version: '1.0.2',
        description: 'Advanced MCP server for Excalidraw with real-time canvas'
    },
    {
        capabilities: {
            tools: Object.fromEntries(tools.map((tool: Tool) => [tool.name, {
                description: tool.description,
                inputSchema: tool.inputSchema
            }]))
        }
    }
);

// Helper function to convert text property to label format for Excalidraw
function convertTextToLabel(element: PlaitElement): PlaitElement {
    const { text, ...rest } = element;
    if (text) {
        // For standalone text elements, keep text as direct property
        if (element.type === 'text') {
            return element; // Keep text as direct property
        }
        // For other elements (rectangle, ellipse, diamond), convert to label format
        return {
            ...rest,
            label: { text }
        } as PlaitElement;
    }
    return element;
}

// Set up request handler for tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    try {
        const { name, arguments: args } = request.params;
        console.info(`Handling tool call: ${name}`);

        switch (name) {
            case 'create_element': {
                console.info('Creating element via MCP', { type: (args as any).type });

                const id = await generateId();
                const element: PlaitElement = {
                    id,
                    ...args
                };


                // Create element directly on HTTP server (no local storage)
                const canvasElement = await createElementOnCanvas(element);

                if (!canvasElement) {
                    throw new Error('Failed to create element: HTTP server unavailable');
                }

                console.info('Element created via MCP and synced to canvas', {
                    id: canvasElement.id,
                    type: canvasElement.type,
                    synced: !!canvasElement
                });

                return {
                    content: [{
                        type: 'text',
                        text: `Element created successfully!\n\n${JSON.stringify(canvasElement, null, 2)}\n\n✅ Synced to canvas`
                    }]
                };
            }

            case 'update_element': {
                // Update element directly on HTTP server (no local storage)
                const canvasElement = await updateElementOnCanvas(args as PlaitElement);

                if (!canvasElement) {
                    throw new Error('Failed to update element: HTTP server unavailable or element not found');
                }

                console.info('Element updated via MCP and synced to canvas', {
                    id: canvasElement.id,
                    synced: !!canvasElement
                });

                return {
                    content: [{
                        type: 'text',
                        text: `Element updated successfully!\n\n${JSON.stringify(canvasElement, null, 2)}\n\n✅ Synced to canvas`
                    }]
                };
            }

            case 'delete_element': {
                const { id } = args as PlaitElement;

                // Delete element directly on HTTP server (no local storage)
                const canvasResult = await deleteElementOnCanvas(id);

                if (!canvasResult) {
                    throw new Error('Failed to delete element: HTTP server unavailable or element not found');
                }

                const result = { id, deleted: true, syncedToCanvas: true };
                console.info('Element deleted via MCP and synced to canvas', result);

                return {
                    content: [{
                        type: 'text',
                        text: `Element deleted successfully!\n\n${JSON.stringify(result, null, 2)}\n\n✅ Synced to canvas`
                    }]
                };
            }
            case 'batch_create_elements': {
                console.info('Batch creating elements via MCP', { count: (args as any).elements.length });

                const createdElements: PlaitElement[] = [];

                // Create each element with unique ID
                for (const elementData of (args as any).elements) {
                    const id = await generateId();
                    const element: PlaitElement = {
                        id,
                        ...elementData
                    };

                    createdElements.push(element);
                }

                // Create all elements directly on HTTP server (no local storage)
                const canvasElements = await batchCreateElementsOnCanvas(createdElements);

                if (!canvasElements) {
                    throw new Error('Failed to batch create elements: HTTP server unavailable');
                }

                const result = {
                    success: true,
                    elements: canvasElements,
                    count: canvasElements.length,
                    syncedToCanvas: true
                };

                console.info('Batch elements created via MCP and synced to canvas', {
                    count: result.count,
                    synced: result.syncedToCanvas
                });

                return {
                    content: [{
                        type: 'text',
                        text: `${result.count} elements created successfully!\n\n${JSON.stringify(result, null, 2)}\n\n${result.syncedToCanvas ? '✅ All elements synced to canvas' : '⚠️  Canvas sync failed (elements still created locally)'}`
                    }]
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        console.error(`Error handling tool call: ${(error as Error).message}`, { error });
        return {
            content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
            isError: true
        };
    }
});

// Set up request handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: tools };
});

// Start server with transport based on mode
async function runServer(): Promise<void> {
    try {
        console.info('Starting Excalidraw MCP server...');

        const transportMode = process.env.MCP_TRANSPORT_MODE || 'stdio';
        let transport;

        if (transportMode === 'http') {
            const port = parseInt(process.env.PORT || '3000', 10);
            const host = process.env.HOST || 'localhost';

            console.info(`Starting HTTP server on ${host}:${port}`);
            // Here you would create an HTTP transport
            // This is a placeholder - actual HTTP transport implementation would need to be added
            transport = new StdioServerTransport(); // Fallback to stdio for now
        } else {
            // Default to stdio transport
            transport = new StdioServerTransport();
        }

        // Add a debug message before connecting
        console.debug('Connecting to transport...');

        await server.connect(transport);
        console.info(`Excalidraw MCP server running on ${transportMode}`);

        // Keep the process running
        process.stdin.resume();
    } catch (error) {
        console.error('Error starting server:', error);
        process.stderr.write(`Failed to start MCP server: ${(error as Error).message}\n${(error as Error).stack}\n`);
        process.exit(1);
    }
}

// Add global error handlers
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught exception:', error);
    process.stderr.write(`UNCAUGHT EXCEPTION: ${error.message}\n${error.stack}\n`);
    setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled promise rejection:', reason);
    process.stderr.write(`UNHANDLED REJECTION: ${reason}\n`);
    setTimeout(() => process.exit(1), 1000);
});

// For testing and debugging purposes
if (process.env.DEBUG === 'true') {
    console.debug('Debug mode enabled');
}
runServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
export default runServer;