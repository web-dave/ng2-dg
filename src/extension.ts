import { logger } from './lib/logger';
/// <reference path="../typings/index.d.ts" />

'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {Engine} from './lib/dot';
import {Crawler} from './lib/walker';

export function activate(context: vscode.ExtensionContext) {

    let _ng2dg = vscode.commands.registerCommand('extension.ng2dgt', () => {
        let options = { matchOnDescription: false, placeHolder: "Select your sourcefolder" };
        let cwd = vscode.workspace.rootPath;
        let foldersList = [];
        var folders = fs.readdirSync(cwd);
        for (var f = 0; f < folders.length; f++) {
            var foldername = path.join(cwd, folders[f]);
            var _foldername = folders[f];
            var stat = fs.lstatSync(foldername);

            if (stat.isDirectory()) {
                foldersList.push(_foldername);
            }
        };
        // return;
        vscode.window.showQuickPick(foldersList,options).then((data) => {
            // comment = historyUtil.parseLog(commits[items.indexOf(data)]);
            logger.appendLine(data);
            // console.log(comment);

            let tscjson = fromDir(cwd + '/' + data, 'tsconfig.json')
            let program = {
                tsconfig: tscjson
            }
            let pkg = require(cwd + '/package.json');
            let files: string[] = [];

            if (!fs.existsSync(program.tsconfig)) {
                logger.appendLine('"tsconfig.json" file was not found  at: ' + tscjson);
                vscode.window.showErrorMessage('"tsconfig.json" file was not found at: ' + tscjson);
                process.exit(1);
            }
            else {
                vscode.window.showInformationMessage('progress...');
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

                let crawler = new Crawler.Dependencies(
                    files, {
                        tsconfigDirectory: cwd
                    }
                );
             


                let deps = crawler.getDependencies();

                if (deps.length <= 0) {
                    logger.append('No dependencies found');
                    process.exit(0);
                }

                let engine = new Engine.Dot({
                    output: `${cwd}/documentation/${pkg.name}`,
                    displayLegend: true, 
                    outputFormats: 'html,svg,json,dot,png' 

                });
                engine
                    .generateGraph(deps)
                    .then(file => { })
                    .catch(e => logger.append(e))
                    .finally(_ => logger.append('done'));


                logger.show(vscode.ViewColumn.Three);

                vscode.window.showInformationMessage(`finished! Take a look at: ${cwd}/documentation/${pkg.name}`);
            }

        });
    });

    context.subscriptions.push(_ng2dg);
    logger.init(context);

    let fromDir = function (startPath, filter) {


        if (!fs.existsSync(startPath)) {
            logger.appendLine("no dir " + startPath);
            return;
        }

        var files = fs.readdirSync(startPath);
        for (var i = 0; i < files.length; i++) {
            var filename = path.join(startPath, files[i]);
            var stat = fs.lstatSync(filename);

            if (stat.isDirectory() && (filename.indexOf('node_modules') === -1)) {
                fromDir(filename, filter); //recurse
            }
            else if (filename.indexOf(filter) >= 0) {
                return filename;
            };
        };
    };
}


export function deactivate() {

}

