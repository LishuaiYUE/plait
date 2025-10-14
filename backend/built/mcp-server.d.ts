import { WebSocket } from 'ws';
export declare class WeatherMCPServer {
    private port;
    private wss;
    constructor(port?: number);
    setupServer(): void;
    sendTools(ws: WebSocket): void;
    handleMessage(ws: WebSocket, message: any): Promise<void>;
    sendError(ws: WebSocket, message: string, id?: null): void;
}
//# sourceMappingURL=mcp-server.d.ts.map