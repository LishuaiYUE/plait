import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios';
import { tools } from './tools/tools';
import { config } from './config';

export class PlaitMCPServer {
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
                        result = await axios.post(`${config.apiBaseUrl}/api/elements`, args);
                        break;
                    case "update_element":
                        // 调用API创建元素
                        result = await axios.put(`${config.apiBaseUrl}/api/elements/${args.id}`, args);
                        break;
                    case "delete_element":
                        // 调用API创建元素
                        result = await axios.delete(`${config.apiBaseUrl}/api/elements/${args.id}`);
                        break;
                    case "batch_create_elements":
                        // 调用API创建元素
                        result = await axios.post(`${config.apiBaseUrl}/api/elements/batch`, args);
                        break;
                    default:
                        throw new Error(`Unknown tool: ${tool}`);
                }

                ws.send(JSON.stringify({
                    type: "tool_result",
                    id,
                    content: result.data
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
const server = new PlaitMCPServer(3001);
console.log('Weather MCP Server running on port 3001');