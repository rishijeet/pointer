import * as vscode from 'vscode';
import { LLMService } from './types';

export class ClaudeService implements LLMService {
    private readonly outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    async generateResponse(text: string): Promise<string> {
        const apiKey = vscode.workspace.getConfiguration('pointer').get('anthropicApiKey');
        if (!apiKey) {
            throw new Error('Anthropic API key not configured');
        }

        // TODO: Implement Claude API integration
        return `[Claude-2] This is a placeholder response. Implement Claude API integration.`;
    }
}
