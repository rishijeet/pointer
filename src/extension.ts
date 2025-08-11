import * as vscode from "vscode";
import { ChatPanel } from "./ChatPanel";

export function activate(context: vscode.ExtensionContext) {
  const openChat = vscode.commands.registerCommand(
    "pointer.openChat",
    () => {
      ChatPanel.createOrShow(context.extensionUri);
    }
  );

  context.subscriptions.push(openChat);
}
