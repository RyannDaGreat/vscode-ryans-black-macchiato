import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ryans-black-macchiato.formatPython', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        // If there is no selection, default to formatting the whole document
        const code = document.getText(selection.isEmpty ? new vscode.Range(0, 0, document.lineCount, 0) : selection);

        const pythonPath = vscode.workspace.getConfiguration('pythonBlackMacchiato').get<string>('pythonPath', 'python');
        const cmd = `${pythonPath} -m macchiato`;

        const process = exec(cmd, (err, stdout, stderr) => {
            if (err) {
                // Error handling for the child process execution
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
            }

            editor.edit(editBuilder => {
                if (stdout) {
                    if (selection.isEmpty) {
                        const entireRange = new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(document.getText().length)
                        );
                        editBuilder.replace(entireRange, stdout);
                    } else {
                        editBuilder.replace(selection, stdout);
                    }
                } else {
                    vscode.window.showErrorMessage('No output from formatting command.');
                }
            });
        });

        if (process.stdin) {
            process.stdin.write(code);
            process.stdin.end();
        } else {
            vscode.window.showErrorMessage('Failed to launch formatting process.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    // Clean up if needed
}
