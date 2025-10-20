import axios from 'axios';
import { config } from './config';
import { ChatMessages } from './types/chat';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { toolAuxiliaryPrompt } from './tools/schemas';
import { RequestTool } from './tools/tools';
import MCPClient from './mcp-client';
export class McpAgent {
    // private mcpClient: Client;
    constructor() {
        // const transport = new StdioClientTransport({
        //     command: 'ts-node',
        //     args: ['/Users/gonglinjie/workspace/worktile/plait/backend/src/mcp-tools.ts']
        // });
        // this.mcpClient = new Client({
        //     name: 'plait',
        //     version: '1.0.0'
        // });
        // this.mcpClient.connect(transport);
    }
    async callLLM(messages: ChatMessages, inputTools?: any[]) {
        const tools = inputTools?.map((x: any) => {
            return {
                type: 'function',
                function: x
            };
        });
        try {
            const apiKey = process.env.AI_API_KEY;
            const baseURL = process.env.AI_BASE_URL;

            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const payload: any = {
                model: process.env.AI_MODEL,
                messages: Array.isArray(messages) ? messages : [{ role: 'user', content: messages }],
                max_tokens: config.claude.maxTokens,
                temperature: config.claude.temperature
            };
            if (tools) {
                payload[`tools`] = tools;
                payload[`tool_choice`] = 'required';
            }

            const response = await axios.post(`${baseURL}/chat/completions`, payload, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message;
            // return this.extractJSONFromResponse(content);
        } catch (error: any) {
            console.error('OpenAI API error:', error.response?.data || error.message);

            // 模拟回退响应（当没有 API key 时）
            if (error.response?.status === 401) {
                return `这是一个模拟响应（需要配置 OPENAI_API_KEY 环境变量来使用真实 AI）\n\n用户消息: ${messages}`;
            }

            throw new Error(`AI service error: ${error.message}`);
        }
    }

    async deepThink(messages: ChatMessages, mcpClient: MCPClient) {
        // 获取MCP Server提供的所有可用工具列表:cite[5]
        const mcpToolListResponse = await mcpClient.getAvailableTools();
        const tools = mcpToolListResponse.map((tool: any) => {
            return {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema
            };
        });
        console.log(`🤔 开始深度思考问题: '${JSON.stringify(messages)}'\n`);

        // 1. 创建初始计划
        console.log(`📋 规划阶段...`);
        let plan: any[] = await this.createPlan(messages);
        console.log(`制定计划:`, plan.map((step, i) => `\n  ${i + 1}. ${step}`).join(''));

        let allResults = [];
        let iteration = 0;
        const maxIterations = 50; // 防止无限循环

        // 2. 执行与重规划循环
        while (plan.length > 0 && iteration < maxIterations) {
            iteration++;
            console.log(`\n🔄 第 ${iteration} 轮执行开始 (剩余 ${plan.length} 个任务)...`);

            // 执行下一个任务
            const currentTask = plan[0];
            console.log(`🔧 执行任务: ${currentTask}`);
            const taskResult = await this.executeTask(currentTask, allResults, messages, tools, mcpClient);
            console.log(`📝 任务结果: ${JSON.stringify(taskResult.slice(0, 100))}...`);

            // 保存结果并更新计划
            allResults.push(taskResult);
            plan.splice(0, 1);
        }

        // 3. 合成最终答案
        console.log(`\n🎯 合成最终答案...`);
        const synthesizePrompt = `你是一个流程图生成专家。请基于以下所有步骤的研究结果，为原始问题提供一个完整、准确、精炼的最终答案，并使用工具输出流程图代码。
      
      研究过程与发现：
      ${allResults.map((result, index) => `步骤 ${index + 1}:\n${result}`).join('\n\n')}
      
      请给出最终答案：
      `;
        const finalAnswer = await this.callLLM([{ role: 'system', content: synthesizePrompt }, ...messages]);
        return finalAnswer.content;
    }

    private async executeTask(taskDescription: any, pastResults: any[], messages: ChatMessages, tools: RequestTool[], mcpClient: MCPClient) {
        const context = pastResults.length > 0 ? `之前步骤的结果：\n${pastResults.map((r, i) => `步骤 ${i + 1}: ${r}`).join('\n')}` : '尚无之前步骤的结果。';
        const toolDescriptions = tools
            .map((tool) => `工具: ${tool.name}\n描述: ${tool.description}\n参数: ${JSON.stringify(tool.parameters)}`)
            .join('\n\n');

        const executePrompt = `你是一个流程图生成助理，负责生成相应的流程图节点。你能够理解用户的自然语言描述，自动推断所需的参数，并生成相应的流程图代码，需要确定合适的位置，填充颜色，必要的箭头连接线， 确保生成的代码符合 Plait 工具集的要求，并根据用户的描述，使用适当的工具来创建或更新流程图元素。\n
      
      ${context}

      当前任务：${taskDescription}

      ${toolDescriptions}

      ${toolAuxiliaryPrompt}
      `;
        messages.push({ role: 'system', content: executePrompt });
        const message = await this.callLLM(messages, tools);
        messages.push(message);
        if (message.tool_calls) {
            const toolResults = [];
            for (const toolCall of message.tool_calls) {
                // 执行工具调用
                const result = await mcpClient.callTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
                toolResults.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(result)
                });
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id, // 必须匹配对应的tool_call_id
                    content: JSON.stringify(result)
                });
            }

            // 将工具执行的结果作为新的上下文信息，再次发送给模型，让它生成最终回答
            // messages.push(message);

            // const finalResponse = await this.callLLM(messages);
            // return finalResponse.choices[0].message.content;
            return toolResults;
        } else {
            return message.content;
        }
    }

    private async createPlan(messages: ChatMessages, tools?: RequestTool[]) {
        const planPrompt = `你是一个专业的流程图生成专家，专门使用 Plait 工具集来创建和编辑流程图元素。你能够理解用户的自然语言描述，自动推断所需的参数。你的任务是针对给定目标，制定一个简单的分步计划。
      该计划应包含各项独立任务，包括必要的连线信息，这些任务若执行正确，就能得出正确答案。请勿添加任何多余步骤。
      最后一步的结果须为最终答案。确保每一步都包含所需的全部信息。
      请将计划输出为一个 JSON 数组，例如：['第一步', '第二步', '第三步']`;
        messages.push({
            role: 'system',
            content: planPrompt
        });
        const planResponse = await this.callLLM(messages, tools);

        // 尝试从返回内容中解析 JSON 数组
        try {
            // 有时模型返回的内容可能包含 markdown 代码块标记，这里尝试提取纯 JSON 部分
            const jsonMatch = planResponse.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(planResponse.content);
        } catch (parseError) {
            console.error('解析计划失败，返回内容为:', planResponse.content);
            // 如果解析失败，退回一个简单的默认计划
            return [`搜索信息: ${messages[messages.length - 1]?.content}`, '比较和分析信息', '给出最终答案和推理过程'];
        }
    }
}
