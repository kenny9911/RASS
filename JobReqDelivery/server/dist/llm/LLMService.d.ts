import { LLMOptions, LLMMessage, LLMResponse, TokenUsage } from '../types/index.js';
export interface LLMProvider {
    name: string;
    complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
    completeWithUsage?(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
    stream(messages: LLMMessage[], options?: LLMOptions): AsyncIterable<string>;
    getModel?(): string;
}
declare class LLMService {
    private provider;
    constructor();
    switchProvider(providerName: string): void;
    getProviderName(): string;
    getModel(): string;
    complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
    completeWithUsage(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
    stream(messages: LLMMessage[], options?: LLMOptions): AsyncIterable<string>;
    chat(systemPrompt: string, userMessage: string, options?: LLMOptions): Promise<string>;
    chatWithUsage(systemPrompt: string, userMessage: string, options?: LLMOptions): Promise<LLMResponse>;
    chatJSON<T>(systemPrompt: string, userMessage: string, options?: LLMOptions): Promise<T>;
    chatJSONWithUsage<T>(systemPrompt: string, userMessage: string, options?: LLMOptions): Promise<{
        data: T;
        usage: TokenUsage;
        latencyMs: number;
    }>;
    private tryFixTruncatedJSON;
}
export declare const llmService: LLMService;
export {};
//# sourceMappingURL=LLMService.d.ts.map