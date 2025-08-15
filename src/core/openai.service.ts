import * as vscode from 'vscode';
import { LLMService } from './types';

export class OpenAIService implements LLMService {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly model: string;

    constructor(model: string, outputChannel: vscode.OutputChannel) {
        this.model = model;
        this.outputChannel = outputChannel;
    }

    async generateResponse(text: string): Promise<string> {
        const apiKey = vscode.workspace.getConfiguration('pointer').get('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        // TODO: Implement OpenAI API integration
        return `[${this.model}] This is a placeholder response. Implement OpenAI API integration.`;
    }
}
