import * as vscode from 'vscode';
import { ModelType, LLMService } from './types';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';
import { ClaudeService } from './claude.service';

export class LLMServiceFactory {
    private static services: Map<ModelType, LLMService> = new Map();

    static getService(model: ModelType, outputChannel: vscode.OutputChannel): LLMService {
        if (!this.services.has(model)) {
            switch (model) {
                case 'gemini-2.5-pro':
                    this.services.set(model, new GeminiService(model, outputChannel));
                    break;
                case 'gemini-2.5-flash':
                    this.services.set(model, new GeminiService(model, outputChannel));
                    break;
                case 'gpt-3.5-turbo':
                case 'gpt-4':
                    this.services.set(model, new OpenAIService(model, outputChannel));
                    break;
                case 'claude-2':
                    this.services.set(model, new ClaudeService(outputChannel));
                    break;
                default:
                    throw new Error(`Unsupported model: ${model}`);
            }
        }

        return this.services.get(model)!;
    }

    static clearServices() {
        this.services.clear();
    }
}
