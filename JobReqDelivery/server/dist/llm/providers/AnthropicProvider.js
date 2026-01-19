import { llmConfig } from '../../routes/config.js';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
export class AnthropicProvider {
    name = 'Anthropic';
    apiKey;
    constructor() {
        this.apiKey = process.env.ANTHROPIC_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ ANTHROPIC_API_KEY 未设置');
        }
    }
    getModel() {
        const model = llmConfig.model;
        if (model.includes('/')) {
            return 'claude-3-sonnet-20240229';
        }
        return model || 'claude-3-sonnet-20240229';
    }
    async complete(messages, options) {
        const model = this.getModel();
        // Anthropic 需要分离 system 消息
        const systemMessage = messages.find(m => m.role === 'system');
        const otherMessages = messages.filter(m => m.role !== 'system');
        try {
            const response = await fetch(ANTHROPIC_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model,
                    system: systemMessage?.content || '',
                    messages: otherMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    max_tokens: options?.maxTokens ?? 4096,
                    temperature: options?.temperature ?? 0.7
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Anthropic API 错误: ${error.error?.message || response.statusText}`);
            }
            const data = await response.json();
            return data.content[0]?.text || '';
        }
        catch (error) {
            console.error('Anthropic 请求失败:', error);
            throw error;
        }
    }
    async *stream(messages, options) {
        const model = this.getModel();
        const systemMessage = messages.find(m => m.role === 'system');
        const otherMessages = messages.filter(m => m.role !== 'system');
        try {
            const response = await fetch(ANTHROPIC_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model,
                    system: systemMessage?.content || '',
                    messages: otherMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    max_tokens: options?.maxTokens ?? 4096,
                    temperature: options?.temperature ?? 0.7,
                    stream: true
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Anthropic API 错误: ${error.error?.message || response.statusText}`);
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
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'content_block_delta') {
                                const content = parsed.delta?.text;
                                if (content)
                                    yield content;
                            }
                        }
                        catch {
                            // 忽略解析错误
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Anthropic 流式请求失败:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=AnthropicProvider.js.map