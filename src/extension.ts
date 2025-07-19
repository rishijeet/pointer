import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "pointer.processChat",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "chatWindow",
        "Chat Window",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getWebviewContent();

      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.type) {
            case "chat":
              const reply = `You said: "${message.text}"`; // You can integrate AI here
              panel.webview.postMessage({ type: "reply", text: reply });
              break;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; }
        #messages { flex: 1; padding: 10px; overflow-y: auto; background: #1e1e1e; color: white; }
        #input { display: flex; }
        #inputBox { flex: 1; padding: 10px; }
        button { padding: 10px; }
      </style>
    </head>
    <body>
      <div id="messages"></div>
      <div id="input">
        <input type="text" id="inputBox" placeholder="Type your message" />
        <button onclick="sendMessage()">Send</button>
      </div>

      <script>
        const vscode = acquireVsCodeApi();

        function sendMessage() {
          const inputBox = document.getElementById('inputBox');
          const msg = inputBox.value;
          if (msg.trim()) {
            appendMessage('You', msg);
            vscode.postMessage({ type: 'chat', text: msg });
            inputBox.value = '';
          }
        }

        function appendMessage(sender, text) {
          const messages = document.getElementById('messages');
          const message = document.createElement('div');
          message.textContent = sender + ': ' + text;
          messages.appendChild(message);
          messages.scrollTop = messages.scrollHeight;
        }

        window.addEventListener('message', event => {
          const msg = event.data;
          if (msg.type === 'reply') {
            appendMessage('Bot', msg.text);
          }
        });
      </script>
    </body>
    </html>
  `;
}
