import * as vscode from 'vscode';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMService, ModelType } from './types';

export class GeminiService implements LLMService {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly selectedModel: ModelType;

    constructor(model: ModelType, outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.selectedModel = model;
    }

    async generateResponse(text: string): Promise<string> {
        const apiKey = vscode.workspace.getConfiguration('pointer').get('geminiApiKey');
        if (!apiKey) {
            this.outputChannel.appendLine('Error: Gemini API key not configured');
            throw new Error('Google Gemini API key not configured');
        }

        try {
            this.outputChannel.appendLine(`[${new Date().toISOString()}] Initializing Gemini API`);
            
            // Initialize the Gemini AI instance
            const genAI = new GoogleGenerativeAI(apiKey as string);
            const model = genAI.getGenerativeModel({ model: this.selectedModel });
            
            this.outputChannel.appendLine(`[${new Date().toISOString()}] Sending request to Gemini API`);
            this.outputChannel.appendLine(`Request payload length: ${text.length} characters`);
            
            // Generate content
            const result = await model.generateContent(text);
            const response = await result.response;
            const responseText = response.text();
            
            this.outputChannel.appendLine(`[${new Date().toISOString()}] Successfully received response`);
            this.outputChannel.appendLine(`Response length: ${responseText.length} characters`);
            
            return responseText;
        } catch (error) {
            this.outputChannel.appendLine(`[${new Date().toISOString()}] Error calling Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
}
