'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    
    let _ng2dg = vscode.commands.registerCommand('extension.ng2dgt', () => {
        let cmd = 'node_modules\\angular2-dependencies-graph\\bin\\index.js';
        let args = [' --tsconfig ./tsconfig.json'];
        let cwd = vscode.workspace.rootPath;
        let p = cp.exec(cmd, { cwd: cwd, env: process.env });
        p.stderr.on('data', (data: string) => {
            outputChannel.append(data);
        });
        p.stdout.on('data', (data: string) => {
            outputChannel.append(data);
        });
        outputChannel.show(vscode.ViewColumn.Three);

    });
    
    context.subscriptions.push(_ng2dg);
    outputChannel = vscode.window.createOutputChannel('ng2-dg');
    context.subscriptions.push(outputChannel);
}

export function deactivate() {
    
}