import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('pointer.processChat', async () => {
        // Get active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found');
            return;
        }

        // Get the selected text (chat output)
        const selection = editor.selection;
        const chatOutput = editor.document.getText(selection);

        if (!chatOutput) {
            vscode.window.showErrorMessage('No text selected. Please select the chat output to process.');
            return;
        }

        try {
            // Parse the chat output for file operations
            const operations = parseChatOutput(chatOutput);
            
            // Execute file operations
            for (const op of operations) {
                await executeFileOperation(op);
            }
            
            vscode.window.showInformationMessage(`Successfully processed ${operations.length} file operations.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error processing chat output: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(disposable);
}

interface FileOperation {
    type: 'create' | 'modify' | 'delete';
    filePath: string;
    content?: string;
}

function parseChatOutput(chatOutput: string): FileOperation[] {
    // This is a simple parser - you'll need to enhance it based on your chat output format
    const operations: FileOperation[] = [];
    
    // Example parsing logic (very basic)
    const lines = chatOutput.split('\n');
    let currentOperation: Partial<FileOperation> = {};
    
    for (const line of lines) {
        if (line.startsWith('CREATE:')) {
            currentOperation = { type: 'create', filePath: line.replace('CREATE:', '').trim() };
        } else if (line.startsWith('MODIFY:')) {
            currentOperation = { type: 'modify', filePath: line.replace('MODIFY:', '').trim() };
        } else if (line.startsWith('DELETE:')) {
            operations.push({ type: 'delete', filePath: line.replace('DELETE:', '').trim() });
            currentOperation = {};
        } else if (line.startsWith('CONTENT:')) {
            // Skip the CONTENT: line itself
        } else if (currentOperation.type && currentOperation.filePath) {
            if (!currentOperation.content) {
                currentOperation.content = '';
            }
            currentOperation.content += line + '\n';
        }
    }
    
    // Add any pending operation with content
    if (currentOperation.type && currentOperation.filePath && currentOperation.content) {
        operations.push(currentOperation as FileOperation);
    }
    
    return operations;
}

async function executeFileOperation(operation: FileOperation): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error('No workspace folder open');
    }
    
    const workspacePath = workspaceFolders[0].uri.fsPath;
    const fullPath = path.join(workspacePath, operation.filePath);
    
    switch (operation.type) {
        case 'create':
            if (!operation.content) {
                throw new Error('No content provided for file creation');
            }
            await fs.promises.writeFile(fullPath, operation.content);
            break;
            
        case 'modify':
            if (!operation.content) {
                throw new Error('No content provided for file modification');
            }
            await fs.promises.writeFile(fullPath, operation.content);
            break;
            
        case 'delete':
            await fs.promises.unlink(fullPath);
            break;
    }
    
    // Open the file in editor if it was created or modified
    if (operation.type !== 'delete') {
        const uri = vscode.Uri.file(fullPath);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
    }
}

export function deactivate() {} 