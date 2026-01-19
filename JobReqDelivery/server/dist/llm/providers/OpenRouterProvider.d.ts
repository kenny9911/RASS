import { LLMProvider } from '../LLMService.js';
import { LLMOptions, LLMMessage, LLMResponse } from '../../types/index.js';
export declare class OpenRouterProvider implements LLMProvider {
    name: string;
    private apiKey;
    constructor();
    getModel(): string;
    private calculateCost;
    complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
    completeWithUsage(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
    stream(messages: LLMMessage[], options?: LLMOptions): AsyncIterable<string>;
}
//# sourceMappingURL=OpenRouterProvider.d.ts.map