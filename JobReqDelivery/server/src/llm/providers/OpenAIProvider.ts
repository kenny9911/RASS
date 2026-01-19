import { LLMProvider } from '../LLMService.js';
import { LLMOptions, LLMMessage } from '../../types/index.js';
import { llmConfig } from '../../routes/config.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY 未设置');
    }
  }

  getModel(): string {
    // 如果使用 OpenAI，但模型是 OpenRouter 格式，则使用默认
    const model = llmConfig.model;
    if (model.includes('/')) {
      return 'gpt-4o';
    }
    return model || 'gpt-4o';
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const model = this.getModel();
    
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
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

      if (!response.ok) {
        const error = await response.json() as { error?: { message?: string } };
        throw new Error(`OpenAI API 错误: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json() as { choices: Array<{ message?: { content?: string } }> };
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI 请求失败:', error);
      throw error;
    }
  }

  async *stream(messages: LLMMessage[], options?: LLMOptions): AsyncIterable<string> {
    const model = this.getModel();
    
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
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
        const error = await response.json() as { error?: { message?: string } };
        throw new Error(`OpenAI API 错误: ${error.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) yield content;
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenAI 流式请求失败:', error);
      throw error;
    }
  }
}
