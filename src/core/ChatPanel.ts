import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ChatMessage, ModelType, WebviewPanelConfig } from './types';
import { LLMServiceFactory } from './llm.factory';
import { getNonce } from '../utils/utils';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private static readonly outputChannel = vscode.window.createOutputChannel('Pointer Chat');

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private readonly disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.ViewColumn.One;

        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel.panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "chatWindow",
            "Pointer Chat",
            column,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, "out", "webview")],
            }
        );

        ChatPanel.currentPanel = new ChatPanel({
            panel,
            extensionUri,
            outputChannel: this.outputChannel
        });
    }

    private constructor(config: WebviewPanelConfig) {
        this.panel = config.panel;
        this.extensionUri = config.extensionUri;

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.html = this._getHtmlForWebview(this.panel.webview);
        this.setupMessageHandler();
    }

    private setupMessageHandler() {
        this.panel.webview.onDidReceiveMessage(
            async (message: ChatMessage) => {
                if (message.type === "chat") {
                    try {
                        const service = LLMServiceFactory.getService(
                            message.model as ModelType,
                            ChatPanel.outputChannel
                        );
                        const response = await service.generateResponse(message.text);
                        this.panel.webview.postMessage({ 
                            type: "reply", 
                            text: response 
                        });
                    } catch (error) {
                        this.panel.webview.postMessage({ 
                            type: "reply", 
                            text: "Sorry, there was an error processing your message. Please try again." 
                        });
                    }
                }
            },
            null,
            this.disposables
        );
    }

    public dispose() {
        ChatPanel.currentPanel = undefined;
        LLMServiceFactory.clearServices();

        this.panel.dispose();
        while (this.disposables.length) {
            const d = this.disposables.pop();
            if (d) {
                d.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const buildPathOnDisk = vscode.Uri.joinPath(this.extensionUri, "out", "webview");
        const manifestPath = path.join(buildPathOnDisk.fsPath, 'asset-manifest.json');
        
        let manifest;
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
            vscode.window.showErrorMessage("React app build not found. Please run 'npm run compile' and reload.");
            return `<html><body>React app not built. Please run 'npm run compile' in the project root.</body></html>`;
        }

        const mainScript = manifest.files['main.js'];
        const mainStyle = manifest.files['main.css'];

        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(buildPathOnDisk, mainScript));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(buildPathOnDisk, mainStyle));
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <link href="${styleUri}" rel="stylesheet">
                <title>Pointer Chat</title>
            </head>
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
