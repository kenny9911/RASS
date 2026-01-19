// 常用模型定价表
export const MODEL_PRICING = {
    'google/gemini-3-flash-preview': { promptPricePerMillion: 0.075, completionPricePerMillion: 0.30 },
    'google/gemini-2.0-flash-exp:free': { promptPricePerMillion: 0, completionPricePerMillion: 0 },
    'openai/gpt-4o': { promptPricePerMillion: 2.5, completionPricePerMillion: 10 },
    'openai/gpt-4o-mini': { promptPricePerMillion: 0.15, completionPricePerMillion: 0.60 },
    'anthropic/claude-3-sonnet': { promptPricePerMillion: 3, completionPricePerMillion: 15 },
    'anthropic/claude-3-haiku': { promptPricePerMillion: 0.25, completionPricePerMillion: 1.25 },
};
//# sourceMappingURL=index.js.map