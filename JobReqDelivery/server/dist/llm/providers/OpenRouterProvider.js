import { MODEL_PRICING } from '../../types/index.js';
import { llmConfig } from '../../routes/config.js';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export class OpenRouterProvider {
    name = 'OpenRouter';
    apiKey;
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ OPENROUTER_API_KEY 未设置');
        }
    }
    getModel() {
        let model = llmConfig.model || 'google/gemini-3-flash-preview';
        // 移除 openrouter/ 前缀（如果存在）
        if (model.startsWith('openrouter/')) {
            model = model.replace('openrouter/', '');
        }
        return model;
    }
    calculateCost(usage, model) {
        const pricing = MODEL_PRICING[model];
        if (!pricing) {
            // 默认定价估算
            return (usage.promptTokens * 0.5 + usage.completionTokens * 1.5) / 1_000_000;
        }
        return ((usage.promptTokens * pricing.promptPricePerMillion) / 1_000_000 +
            (usage.completionTokens * pricing.completionPricePerMillion) / 1_000_000);
    }
    async complete(messages, options) {
        const response = await this.completeWithUsage(messages, options);
        return response.content;
    }
    async completeWithUsage(messages, options) {
        const model = this.getModel();
        const startTime = Date.now();
        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
                    'X-Title': 'Job-Requisition-Assistant'
                },
                body: JSON.stringify({
                    model,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    temperature: options?.temperature ?? 0.7,
                    max_tokens: options?.maxTokens ?? 4096,
                    top_p: options?.topP ?? 1
                })
            });
            const latencyMs = Date.now() - startTime;
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenRouter API 错误: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            // 提取 token 使用量
            const usage = {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                totalTokens: data.usage?.total_tokens || 0,
            };
            usage.cost = this.calculateCost(usage, model);
            console.log(`📊 LLM 调用完成 - 模型: ${model}, Tokens: ${usage.totalTokens}, 耗时: ${latencyMs}ms, 成本: $${usage.cost.toFixed(6)}`);
            return {
                content,
                usage,
                model,
                latencyMs
            };
        }
        catch (err) {
            console.error('OpenRouter 请求失败:', err);
            throw err;
        }
    }
    async *stream(messages, options) {
        const model = this.getModel();
        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
                    'X-Title': 'Job-Requisition-Assistant'
                },
                body: JSON.stringify({
                    model,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    temperature: options?.temperature ?? 0.7,
                    max_tokens: options?.maxTokens ?? 4096,
                    top_p: options?.topP ?? 1,
                    stream: true
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenRouter API 错误: ${errorData.error?.message || response.statusText}`);
            }
            const reader = response.body?.getReader();
            if (!reader)
                throw new Error('无法读取响应流');
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]')
                            return;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content)
                                yield content;
                        }
                        catch {
                            // 忽略解析错误
                        }
                    }
                }
            }
        }
        catch (err) {
            console.error('OpenRouter 流式请求失败:', err);
            throw err;
        }
    }
}
//# sourceMappingURL=OpenRouterProvider.js.map