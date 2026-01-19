import { Router, Request, Response } from 'express';

const router = Router();

// 当前 LLM 配置（内存存储）
let llmConfig = {
  provider: process.env.LLM_PROVIDER || 'openrouter',
  model: process.env.LLM_MODEL || 'google/gemini-3-flash-preview'
};

// 获取当前 LLM 配置
router.get('/llm', (req: Request, res: Response) => {
  res.json({
    provider: llmConfig.provider,
    model: llmConfig.model,
    availableProviders: [
      { 
        id: 'openrouter', 
        name: 'OpenRouter',
        models: ['google/gemini-3-flash-preview', 'openai/gpt-4o', 'anthropic/claude-3-sonnet']
      },
      { 
        id: 'openai', 
        name: 'OpenAI',
        models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
      },
      { 
        id: 'anthropic', 
        name: 'Anthropic',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
      },
      { 
        id: 'ollama', 
        name: 'Ollama (本地)',
        models: ['llama3', 'mistral', 'codellama']
      }
    ]
  });
});

// 更新 LLM 配置
router.post('/llm', (req: Request, res: Response) => {
  const { provider, model } = req.body;

  if (provider) {
    llmConfig.provider = provider;
  }
  if (model) {
    llmConfig.model = model;
  }

  res.json({
    message: 'LLM 配置已更新',
    config: llmConfig
  });
});

export { router as configRoutes };
export { llmConfig };
