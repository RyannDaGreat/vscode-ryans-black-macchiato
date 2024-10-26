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
        let selection = editor.selection;

        // If there is no selection, default to formatting the current line
        if (selection.isEmpty) {
            const currentLine = document.lineAt(selection.active.line);
            selection = new vscode.Selection(currentLine.range.start, currentLine.range.end);
        }

        const code = document.getText(selection);

        const pythonPath = vscode.workspace.getConfiguration('pythonBlackMacchiato').get<string>('pythonPath', 'python');
        const cmd = `${pythonPath} -m rp.libs.rp_black_macchiato`;

        const process = exec(cmd, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
            }

            editor.edit(editBuilder => {
                if (stdout) {
                    editBuilder.replace(selection, stdout);
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