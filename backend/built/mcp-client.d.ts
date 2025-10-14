declare class MCPClient {
    private client;
    private tools;
    constructor(url?: string);
    setupClient(): Promise<unknown>;
    handleServerMessage(message: any): void;
    registerTools(tools: any[]): void;
    callTool(toolName: string, args: any): Promise<unknown>;
    getAvailableTools(): {
        name: string;
        description: any;
        parameters: any;
    }[];
}
export default MCPClient;
//# sourceMappingURL=mcp-client.d.ts.map