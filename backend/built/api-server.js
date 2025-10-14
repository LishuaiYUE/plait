import express from 'express';
import cors from 'cors';
import MCPClient from './mcp-client';
import axios from 'axios';
import { config } from './config';
class APIServer {
    app;
    mcpClient;
    constructor() {
        this.app = express();
        this.mcpClient = new MCPClient();
        this.setupMiddleware();
        this.setupRoutes();
        this.initialize();
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
    }
    setupRoutes() {
        this.app.get('/', (req, res) => {
            res.send('ok');
        });
        // 获取可用工具
        this.app.get('/api/tools', (req, res) => {
            const tools = this.mcpClient.getAvailableTools();
            res.json({ tools });
        });
        // 调用工具
        this.app.post('/api/call-tool', async (req, res) => {
            try {
                const { toolName, arguments: args } = req.body;
                const result = await this.mcpClient.callTool(toolName, args);
                res.json({ success: true, result });
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        // 调用大模型 API
        this.app.post('/api/chat', async (req, res) => {
            try {
                const { message, useTools = true } = req.body;
                const response = await this.processWithLLM(message, useTools);
                res.json({ success: true, response });
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        // 健康检查
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                availableTools: this.mcpClient.getAvailableTools().length
            });
        });
    }
    async processWithLLM(message, useTools = true) {
        if (!useTools) {
            // 直接调用 OpenAI API
            return await this.callOpenAI(message);
        }
        // 分析用户意图，决定是否使用工具
        const tools = this.mcpClient.getAvailableTools();
        const toolDescriptions = tools.map(tool => `工具: ${tool.name}\n描述: ${tool.description}\n参数: ${JSON.stringify(tool.parameters)}`).join('\n\n');
        const systemPrompt = `你是一个智能助手，可以调用各种工具来帮助用户。
可用的工具:
${toolDescriptions}

请分析用户的问题，如果问题涉及到天气查询、数学计算或单位转换，请调用相应的工具。
响应格式:
如果调用工具，返回: {"action": "call_tool", "tool": "工具名称", "args": {参数对象}}
如果直接回答，返回: {"action": "direct_response", "response": "你的回答"}`;
        const analysis = await this.callOpenAI([
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ]);
        try {
            const decision = JSON.parse(analysis);
            if (decision.action === 'call_tool') {
                // 调用工具
                const toolResult = await this.mcpClient.callTool(decision.tool, decision.args);
                // 将工具结果和原始问题一起发送给 LLM 生成最终回答
                const finalResponse = await this.callOpenAI([
                    { role: "system", content: "你是一个有帮助的助手。请根据工具执行结果和用户原始问题，生成自然、友好的回答。" },
                    { role: "user", content: `原始问题: ${message}\n\n工具执行结果: ${JSON.stringify(toolResult, null, 2)}` }
                ]);
                return {
                    type: 'tool_enhanced',
                    toolUsed: decision.tool,
                    toolResult,
                    finalResponse
                };
            }
            else {
                return {
                    type: 'direct',
                    response: decision.response
                };
            }
        }
        catch (error) {
            // 如果 JSON 解析失败，直接返回分析结果
            return {
                type: 'direct',
                response: analysis
            };
        }
    }
    async callOpenAI(messages) {
        try {
            const apiKey = config.claude.apiKey;
            const baseURL = config.claude.baseUrl;
            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }
            const payload = {
                model: config.claude.model,
                messages: Array.isArray(messages) ? messages : [{ role: "user", content: messages }],
                max_tokens: config.claude.maxTokens,
                temperature: config.claude.temperature
            };
            const response = await axios.post(`${baseURL}/chat/completions`, payload, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('OpenAI API error:', error.response?.data || error.message);
            // 模拟回退响应（当没有 API key 时）
            if (error.response?.status === 401) {
                return `这是一个模拟响应（需要配置 OPENAI_API_KEY 环境变量来使用真实 AI）\n\n用户消息: ${messages}`;
            }
            throw new Error(`AI service error: ${error.message}`);
        }
    }
    async initialize() {
        const PORT = 3000;
        this.app.listen(PORT, () => {
            console.log(`MCP Web Server running on http://localhost:${PORT}`);
            console.log('Available endpoints:');
            console.log('  GET  /api/tools - 查看可用工具');
            console.log('  POST /api/call-tool - 调用工具');
            console.log('  POST /api/chat - 与AI对话');
            console.log('  GET  /api/health - 健康检查');
        });
    }
}
// 启动服务器
(async () => {
    new APIServer();
})();
//# sourceMappingURL=api-server.js.map