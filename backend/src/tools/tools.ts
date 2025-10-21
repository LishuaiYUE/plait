import { Tool } from '@modelcontextprotocol/sdk/types';
import { geometrySchema, vectorLineSchema, arrowLineSchema } from './schemas';

export const tools: Tool[] = [
    // create
    {
        name: 'create_geometry',
        description: 'Create a new geometry element',
        inputSchema: geometrySchema
    },
    {
        name: 'create_vector_line',
        description: 'Create a new vector line element',
        inputSchema: vectorLineSchema
    },
    {
        name: 'create_arrow_line',
        description: 'Create a new arrow line element',
        inputSchema: arrowLineSchema
    },
    // update
    {
        name: 'update_geometry',
        description: 'Update the existing geometry element',
        inputSchema: {
            ...geometrySchema,
            properties: { ...geometrySchema.properties, id: { type: 'string', description: 'The ID of the element to update' } },
            required: ['id']
        }
    },
    {
        name: 'update_vector_line',
        description: 'Update the existing vector line element',
        inputSchema: {
            ...vectorLineSchema,
            properties: { ...vectorLineSchema.properties, id: { type: 'string', description: 'The ID of the element to update' } },
            required: ['id']
        }
    },
    {
        name: 'update_arrow_line',
        description: 'Update the existing arrow line element',
        inputSchema: {
            ...arrowLineSchema,
            properties: { ...arrowLineSchema.properties, id: { type: 'string', description: 'The ID of the element to update' } },
            required: ['id']
        }
    },
    // delete
    {
        name: 'delete_element',
        description: 'Delete the element',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'The ID of the element to delete'
                }
            },
            required: ['id']
        }
    }
];

export const toolNames = tools.map((tool: Tool) => tool.name);

export type RequestTool = {
    name?: string;
    description?: string;
    parameters: any;
};

export type AiRequestTool = {
    type: 'function';
    function: RequestTool;
};
