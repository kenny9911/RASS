import { LLMProvider } from '../LLMService.js';
import { LLMOptions, LLMMessage } from '../../types/index.js';
export declare class OllamaProvider implements LLMProvider {
    name: string;
    private baseUrl;
    constructor();
    getModel(): string;
    complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
    stream(messages: LLMMessage[], options?: LLMOptions): AsyncIterable<string>;
}
//# sourceMappingURL=OllamaProvider.d.ts.map