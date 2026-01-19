import { LLMProvider } from '../LLMService.js';
import { LLMOptions, LLMMessage } from '../../types/index.js';
export declare class AnthropicProvider implements LLMProvider {
    name: string;
    private apiKey;
    constructor();
    getModel(): string;
    complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
    stream(messages: LLMMessage[], options?: LLMOptions): AsyncIterable<string>;
}
//# sourceMappingURL=AnthropicProvider.d.ts.map