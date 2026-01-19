import { OpenRouterProvider } from './providers/OpenRouterProvider.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { AnthropicProvider } from './providers/AnthropicProvider.js';
import { OllamaProvider } from './providers/OllamaProvider.js';
import { llmConfig } from '../routes/config.js';
// 提供商工厂
function createProvider(providerName) {
    switch (providerName) {
        case 'openrouter':
            return new OpenRouterProvider();
        case 'openai':
            return new OpenAIProvider();
        case 'anthropic':
            return new AnthropicProvider();
        case 'ollama':
            return new OllamaProvider();
        default:
            console.warn(`未知提供商 "${providerName}"，使用默认 OpenRouter`);
            return new OpenRouterProvider();
    }
}
// LLM 服务单例
class LLMService {
    provider;
    constructor() {
        this.provider = createProvider(llmConfig.provider);
    }
    // 切换提供商
    switchProvider(providerName) {
        this.provider = createProvider(providerName);
        console.log(`🔄 LLM 提供商已切换至: ${this.provider.name}`);
    }
    // 获取当前提供商名称
    getProviderName() {
        return this.provider.name;
    }
    // 获取当前模型
    getModel() {
        return this.provider.getModel?.() || llmConfig.model || 'unknown';
    }
    // 完成请求
    async complete(messages, options) {
        return this.provider.complete(messages, options);
    }
    // 完成请求（带使用量统计）
    async completeWithUsage(messages, options) {
        if (this.provider.completeWithUsage) {
            return this.provider.completeWithUsage(messages, options);
        }
        // 降级：不支持使用量统计的提供商
        const startTime = Date.now();
        const content = await this.provider.complete(messages, options);
        return {
            content,
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 },
            model: this.getModel(),
            latencyMs: Date.now() - startTime
        };
    }
    // 流式请求
    stream(messages, options) {
        return this.provider.stream(messages, options);
    }
    // 便捷方法：单轮对话
    async chat(systemPrompt, userMessage, options) {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];
        return this.complete(messages, options);
    }
    // 便捷方法：单轮对话（带使用量统计）
    async chatWithUsage(systemPrompt, userMessage, options) {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];
        return this.completeWithUsage(messages, options);
    }
    // 便捷方法：JSON 响应
    async chatJSON(systemPrompt, userMessage, options) {
        const response = await this.chat(systemPrompt, userMessage, options);
        // 尝试从响应中提取 JSON
        let jsonString = response;
        // 方法1：尝试从 markdown 代码块提取
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonString = jsonMatch[1].trim();
        }
        else {
            // 方法2：尝试找到 JSON 对象的开始和结束
            const jsonStart = response.indexOf('{');
            const jsonEnd = response.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonString = response.substring(jsonStart, jsonEnd + 1);
            }
        }
        // 尝试修复常见的截断问题
        jsonString = this.tryFixTruncatedJSON(jsonString);
        try {
            return JSON.parse(jsonString);
        }
        catch (error) {
            console.error('JSON 解析失败:', jsonString.substring(0, 500));
            throw new Error('LLM 响应不是有效的 JSON 格式');
        }
    }
    // 便捷方法：JSON 响应（带使用量统计）
    async chatJSONWithUsage(systemPrompt, userMessage, options) {
        const response = await this.chatWithUsage(systemPrompt, userMessage, options);
        // 尝试从响应中提取 JSON
        let jsonString = response.content;
        // 方法1：尝试从 markdown 代码块提取
        const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonString = jsonMatch[1].trim();
        }
        else {
            // 方法2：尝试找到 JSON 对象的开始和结束
            const jsonStart = response.content.indexOf('{');
            const jsonEnd = response.content.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonString = response.content.substring(jsonStart, jsonEnd + 1);
            }
        }
        // 尝试修复常见的截断问题
        jsonString = this.tryFixTruncatedJSON(jsonString);
        try {
            return {
                data: JSON.parse(jsonString),
                usage: response.usage,
                latencyMs: response.latencyMs
            };
        }
        catch (error) {
            console.error('JSON 解析失败，原始响应:', response.content.substring(0, 500));
            console.error('提取的 JSON:', jsonString.substring(0, 500));
            throw new Error('LLM 响应不是有效的 JSON 格式');
        }
    }
    // 尝试修复截断的 JSON
    tryFixTruncatedJSON(jsonString) {
        let fixed = jsonString.trim();
        // 统计括号数量
        let braceCount = 0;
        let bracketCount = 0;
        let inString = false;
        let escape = false;
        for (const char of fixed) {
            if (escape) {
                escape = false;
                continue;
            }
            if (char === '\\') {
                escape = true;
                continue;
            }
            if (char === '"') {
                inString = !inString;
                continue;
            }
            if (inString)
                continue;
            if (char === '{')
                braceCount++;
            if (char === '}')
                braceCount--;
            if (char === '[')
                bracketCount++;
            if (char === ']')
                bracketCount--;
        }
        // 如果在字符串内被截断，尝试关闭字符串
        if (inString) {
            fixed += '"';
        }
        // 添加缺失的闭合括号
        while (bracketCount > 0) {
            fixed += ']';
            bracketCount--;
        }
        while (braceCount > 0) {
            fixed += '}';
            braceCount--;
        }
        // 移除尾部的逗号（在闭合括号之前）
        fixed = fixed.replace(/,(\s*[\]}])/g, '$1');
        return fixed;
    }
}
// 导出单例
export const llmService = new LLMService();
//# sourceMappingURL=LLMService.js.map