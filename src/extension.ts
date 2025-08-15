import * as vscode from "vscode";
import { ChatPanel } from './core/ChatPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('Activating Pointer extension');
  const openChat = vscode.commands.registerCommand(
    "pointer.openChat",
    () => {
      ChatPanel.createOrShow(context.extensionUri);
    }
  );

  context.subscriptions.push(openChat);
}


