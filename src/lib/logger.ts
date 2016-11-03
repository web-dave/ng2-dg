/// <reference path="../../typings/index.d.ts" />

import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;

class Logger {

	constructor() {}
    
	init(context: vscode.ExtensionContext) {
        outputChannel = vscode.window.createOutputChannel('ng2-dg');
        context.subscriptions.push(outputChannel);
	}

	append(msg:any){
        outputChannel.append(msg);
    }

	show(msg:any){
        outputChannel.show(msg);
    }

	appendLine(msg:any){
        outputChannel.appendLine(msg);
    }

    trace(error, file) { 
 		outputChannel.append(`${error}: ${file}`); 
 	} 


}

export let logger = new Logger();
