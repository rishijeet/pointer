import * as vscode from "vscode";
import { getNonce } from "./utils/utils";
import * as fs from "fs";
import * as path from "path";

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.ViewColumn.One;

    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(column);
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

    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    this._panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.type === "chat") {
          // This is a mock response. You can replace this with your actual logic.
          const reply = `Pointer processed: "${message.text}"`;
          this._panel.webview.postMessage({ type: "reply", text: reply });
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;

    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const buildPathOnDisk = vscode.Uri.joinPath(this._extensionUri, "out", "webview");
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