import { WebSocket } from 'ws';
class MCPClient {
    client;
    tools;
    constructor(url = 'ws://localhost:3001') {
        this.tools = new Map();
        this.client = new WebSocket(url);
        this.setupClient();
    }
    async setupClient() {
        return new Promise((resolve, reject) => {
            try {
                this.client.on('message', (data) => {
                    this.handleServerMessage(JSON.parse(data));
                });
                this.client.on('error', (error) => {
                    console.error(`Connection error to ${name}:`, error);
                    reject(error);
                });
                this.client.on('close', () => {
                    console.log(`Disconnected from ${name} MCP Server`);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    handleServerMessage(message) {
        if (message.type === 'tools') {
            this.registerTools(message.tools);
        }
    }
    registerTools(tools) {
        tools.forEach(tool => {
            const toolKey = `${tool.name}`;
            this.tools.set(toolKey, tool);
            console.log(`Registered tool: ${toolKey}`);
        });
    }
    async callTool(toolName, args) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }
        return new Promise((resolve, reject) => {
            const id = Date.now().toString();
            const handleMessage = (data) => {
                try {
                    const message = JSON.parse(data);
                    if (message.id === id) {
                        this.client.removeListener('message', handleMessage);
                        if (message.type === 'tool_result') {
                            resolve(message.content);
                        }
                        else if (message.type === 'error') {
                            reject(new Error(message.message));
                        }
                    }
                }
                catch (error) {
                    reject(error);
                }
            };
            this.client.on('message', handleMessage);
            this.client.send(JSON.stringify({
                type: 'call_tool',
                tool: tool.name,
                arguments: args,
                id
            }));
            // 超时处理
            setTimeout(() => {
                this.client.removeListener('message', handleMessage);
                reject(new Error('Tool call timeout'));
            }, 10000);
        });
    }
    getAvailableTools() {
        return Array.from(this.tools.entries()).map(([name, tool]) => ({
            name,
            description: tool.description,
            parameters: tool.parameters
        }));
    }
}
export default MCPClient;
//# sourceMappingURL=mcp-client.js.map