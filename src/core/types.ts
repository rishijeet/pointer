import * as vscode from 'vscode';

export type ModelType = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-2' | 'gemini-2.5-pro' | 'gemini-2.5-flash';

export interface ChatMessage {
    type: 'chat' | 'reply';
    text: string;
    model?: ModelType;
}

export interface LLMService {
    generateResponse(text: string): Promise<string>;
}

export interface WebviewPanelConfig {
    panel: vscode.WebviewPanel;
    extensionUri: vscode.Uri;
    outputChannel: vscode.OutputChannel;
}
