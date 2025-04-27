import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // Clear any existing subscriptions
    context.subscriptions.forEach(d => d.dispose());
    context.subscriptions.length = 0;

    // Register command with fresh state
    const disposable = vscode.commands.registerCommand('pointer.processChat', async () => {
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
    const operations: FileOperation[] = [];
    const lines = chatOutput.replace(/\r\n/g, '\n').split('\n');
    let currentOperation: Partial<FileOperation> | null = null;
    let inContentBlock = false;

    for (const line of lines) {
        // Skip empty lines unless we're in a content block
        if (!line.trim() && !inContentBlock) {
            continue;
        }

        // Check for new command
        if (line.startsWith('CREATE:') || line.startsWith('MODIFY:') || line.startsWith('DELETE:')) {
            // Save previous operation if exists
            if (currentOperation?.type && currentOperation.filePath) {
                if (currentOperation.type === 'modify' && !currentOperation.content) {
                    throw new Error(`No content provided for MODIFY operation`);
                }
                operations.push(currentOperation as FileOperation);
            }

            // Start new operation
            const type = line.split(':')[0].toLowerCase() as 'create'|'modify'|'delete';
            const filePath = line.substring(line.indexOf(':') + 1).trim();
            
            currentOperation = { type, filePath };
            inContentBlock = (type === 'modify'); // Only enter content block for MODIFY
            continue;
        }

        // For CREATE, treat all subsequent non-command lines as content
        if (currentOperation?.type === 'create') {
            if (!currentOperation.content) {
                currentOperation.content = '';
            }
            currentOperation.content += line + '\n';
            continue;
        }

        // For MODIFY, require CONTENT: marker
        if (line.trim() === 'CONTENT:' && currentOperation?.type === 'modify') {
            currentOperation.content = '';
            inContentBlock = true;
            continue;
        }

        // Accumulate content for MODIFY
        if (inContentBlock && currentOperation?.type === 'modify' && currentOperation.content !== undefined) {
            currentOperation.content += line + '\n';
        }
    }

    // Add the last operation
    if (currentOperation?.type && currentOperation.filePath) {
        if (currentOperation.type === 'modify' && !currentOperation.content) {
            throw new Error(`No content provided for MODIFY operation`);
        }
        if (currentOperation.content) {
            currentOperation.content = currentOperation.content.trim();
        }
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

    try {
        switch (operation.type) {
            case 'create': {
                const content = operation.content || '';
                await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
                await fs.promises.writeFile(fullPath, content);
                vscode.window.showInformationMessage(`Created: ${operation.filePath}`);
                break;
            }
                
            case 'modify': {
                if (!operation.content) {
                    throw new Error('No content provided for file modification');
                }

                // Verify file exists first
                if (!fs.existsSync(fullPath)) {
                    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
                    await fs.promises.writeFile(fullPath, operation.content);
                    vscode.window.showInformationMessage(`Created: ${operation.filePath}`);
                    return;
                }

                // Skip confirmation and modify directly
                await fs.promises.writeFile(fullPath, operation.content);
                vscode.window.showInformationMessage(`Updated: ${operation.filePath}`);
                
                // Reopen file to show changes
                const uri = vscode.Uri.file(fullPath);
                await vscode.commands.executeCommand('vscode.open', uri);
                break;
            }
                
            case 'delete': {
                if (!fs.existsSync(fullPath)) {
                    console.warn(`File not found, skipping delete: ${operation.filePath}`);
                    return;
                }
                // Skip confirmation and delete directly
                await fs.promises.unlink(fullPath);
                vscode.window.showInformationMessage(`Deleted: ${operation.filePath}`);
                break;
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to ${operation.type} ${operation.filePath}: ${error instanceof Error ? error.message : String(error)}`
        );
        console.error(error);
    }
}

/* eslint-disable @typescript-eslint/no-empty-function */
export function deactivate() {
    // Add cleanup logic if needed, or keep empty with eslint disable
}
/* eslint-enable @typescript-eslint/no-empty-function */ 