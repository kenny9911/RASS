import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '../../../.env') });

describe('OpenRouter Provider', () => {
  let OpenRouterProvider: any;

  beforeAll(async () => {
    // 动态导入以确保环境变量已加载
    const module = await import('../llm/providers/OpenRouterProvider.js');
    OpenRouterProvider = module.OpenRouterProvider;
  });

  it('should have API key configured', () => {
    expect(process.env.OPENROUTER_API_KEY).toBeDefined();
    expect(process.env.OPENROUTER_API_KEY?.length).toBeGreaterThan(10);
  });

  it('should strip openrouter/ prefix from model name', async () => {
    // 测试模型名称处理
    const provider = new OpenRouterProvider();
    // 通过私有方法测试（使用反射）
    const getModel = (provider as any).getModel.bind(provider);
    
    // 模拟配置
    const { llmConfig } = await import('../routes/config.js');
    const originalModel = llmConfig.model;
    
    // 测试带前缀的模型名
    llmConfig.model = 'openrouter/google/gemini-3-flash-preview';
    expect(getModel()).toBe('google/gemini-3-flash-preview');
    
    // 测试不带前缀的模型名
    llmConfig.model = 'google/gemini-3-flash-preview';
    expect(getModel()).toBe('google/gemini-3-flash-preview');
    
    // 恢复原始配置
    llmConfig.model = originalModel;
  });

  it('should complete a simple request', async () => {
    const provider = new OpenRouterProvider();
    
    const messages = [
      { role: 'system' as const, content: 'You are a helpful assistant. Reply in Chinese.' },
      { role: 'user' as const, content: '说"你好"' }
    ];

    const response = await provider.complete(messages, {
      temperature: 0.1,
      maxTokens: 50
    });

    expect(response).toBeDefined();
    expect(response.length).toBeGreaterThan(0);
    console.log('LLM 响应:', response);
  }, 30000); // 30秒超时
});

describe('LLM Service', () => {
  let llmService: any;

  beforeAll(async () => {
    const module = await import('../llm/LLMService.js');
    llmService = module.llmService;
  });

  it('should return provider name', () => {
    const name = llmService.getProviderName();
    expect(name).toBeDefined();
    console.log('当前 LLM 提供商:', name);
  });

  it('should complete a chat request', async () => {
    const response = await llmService.chat(
      '你是一个简洁的助手',
      '1+1等于几？只回答数字',
      { temperature: 0.1, maxTokens: 10 }
    );

    expect(response).toBeDefined();
    expect(response).toContain('2');
    console.log('Chat 响应:', response);
  }, 30000);

  it('should parse JSON response', async () => {
    const response: { result: number } = await llmService.chatJSON(
      '你是一个JSON生成器，只返回JSON格式的数据，不要有任何其他文字',
      '返回一个JSON对象，包含result字段，值为42。格式：{"result": 42}',
      { temperature: 0.1, maxTokens: 50 }
    );

    expect(response).toBeDefined();
    expect(response.result).toBe(42);
    console.log('JSON 响应:', response);
  }, 30000);
});
