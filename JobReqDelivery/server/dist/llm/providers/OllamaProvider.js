import { llmConfig } from '../../routes/config.js';
export class OllamaProvider {
    name = 'Ollama';
    baseUrl;
    constructor() {
        this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    }
    getModel() {
        const model = llmConfig.model;
        if (model.includes('/')) {
            return 'llama3';
        }
        return model || 'llama3';
    }
    async complete(messages, options) {
        const model = this.getModel();
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    options: {
                        temperature: options?.temperature ?? 0.7,
                        num_predict: options?.maxTokens ?? 4096,
                        top_p: options?.topP ?? 1
                    },
                    stream: false
                })
            });
            if (!response.ok) {
                throw new Error(`Ollama API 错误: ${response.statusText}`);
            }
            const data = await response.json();
            return data.message?.content || '';
        }
        catch (error) {
            console.error('Ollama 请求失败:', error);
            throw error;
        }
    }
    async *stream(messages, options) {
        const model = this.getModel();
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    options: {
                        temperature: options?.temperature ?? 0.7,
                        num_predict: options?.maxTokens ?? 4096,
                        top_p: options?.topP ?? 1
                    },
                    stream: true
                })
            });
            if (!response.ok) {
                throw new Error(`Ollama API 错误: ${response.statusText}`);
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
                    if (line.trim()) {
                        try {
                            const parsed = JSON.parse(line);
                            const content = parsed.message?.content;
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
        catch (error) {
            console.error('Ollama 流式请求失败:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=OllamaProvider.js.map