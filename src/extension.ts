/// <reference path="../typings/index.d.ts" />

'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {Engine} from './lib/dot';
import {Crawler} from './lib/dependencies';
import {logger} from './lib/logger'

export function activate(context: vscode.ExtensionContext) {

    let _ng2dg = vscode.commands.registerCommand('extension.ng2dgt', () => {

        let cwd = vscode.workspace.rootPath;
        let program = {
            tsconfig: cwd + '/tsconfig.json'
        }
        let pkg = require(cwd + '/package.json');
        let files: string[] = [];
        
        if (!fs.existsSync(program.tsconfig)) {
            logger.appendLine('"tsconfig.json" file was not found in the current directory');
            process.exit(1);
        }
        else {
            
            files = require(program.tsconfig).files;
            
            if (!files) {
                let exclude = [];
                exclude = require(program.tsconfig).exclude || [];
                var walk = (dir) => {
                    let results = [];
                    let list = fs.readdirSync(dir);
                    list.forEach((file) => {
                        if (exclude.indexOf(file) < 0) {
                            file = path.join(dir, file);
                            let stat = fs.statSync(file);
                            if (stat && stat.isDirectory()) {
                                results = results.concat(walk(file));
                            }
                            else if (path.extname(file) === '.ts') {
                                results.push(file);
                            }
                        }
                    });
                    return results;
                };

                files = walk(cwd);
            }
        }


        let crawler = new Crawler.Dependencies(
            files
        );

        let deps = crawler.getDependencies();

        if (deps.length <= 0) {
            logger.append('No dependencies found');
            process.exit(0);
        }

        let engine = new Engine.Dot({
            output:`${cwd}/documentation/${pkg.name}`
        });
        engine
            .generateGraph(deps)
            .then(file => {})
            .catch(e => logger.append(e))
            .finally(_ => logger.append('done'));


        logger.show(vscode.ViewColumn.Three);

    });

    context.subscriptions.push(_ng2dg);
    logger.init(context);
}


export function deactivate() {

}