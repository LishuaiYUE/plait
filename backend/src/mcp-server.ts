import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios';

export class WeatherMCPServer {
    private port: number;
    private wss: WebSocketServer;
    constructor(port = 3001) {
        this.port = port;
        this.wss = new WebSocketServer({ port });
        this.setupServer();
    }

    setupServer() {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('MCP Server: Client connected');

            ws.on('message', async (data: string) => {
                try {
                    const message = JSON.parse(data);
                    await this.handleMessage(ws, message);
                } catch (error: any) {
                    this.sendError(ws, error.message);
                }
            });

            // 发送初始化的工具列表
            this.sendTools(ws);
        });
    }

    sendTools(ws: WebSocket) {
        const tools: any[] = [];

        ws.send(JSON.stringify({
            type: "tools",
            tools: tools
        }));
    }

    async handleMessage(ws: WebSocket, message: any) {
        const { type, tool, arguments: args, id } = message;

        if (type === "call_tool") {
            try {
                let result;
                switch (tool) {
                    case "create_element":
                        // 调用API创建元素
                        break;
                    case "batch_create_element":
                        // 调用API创建元素
                        break;
                    default:
                        throw new Error(`Unknown tool: ${tool}`);
                }

                ws.send(JSON.stringify({
                    type: "tool_result",
                    id,
                    content: result
                }));
            } catch (error: any) {
                this.sendError(ws, error.message, id);
            }
        }
    }


    sendError(ws: WebSocket, message: string, id = null) {
        ws.send(JSON.stringify({
            type: "error",
            id,
            message
        }));
    }
}

// 启动服务器
const server = new WeatherMCPServer(3001);
console.log('Weather MCP Server running on port 3001');