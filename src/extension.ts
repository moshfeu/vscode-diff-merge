import * as vscode from 'vscode';
import {join} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const readOptions = {
  encoding: 'utf8'
};

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('diffMerge.chooseFile', async (e: vscode.Uri) => {
    const file = await vscode.window.showOpenDialog({});
    if (file) {
      showDiff(file[0], e, context);
    }
  });
}

function showDiff(leftUri: vscode.Uri, rightUri: vscode.Uri, context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'mergeDiff.file',
    'Diff & merge',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  // And set its HTML content
  panel.webview.html = getWebviewContent(leftUri, rightUri, context);
  panel.webview.onDidReceiveMessage(e => {
    switch (e.command) {
      case 'save':
        const {left: leftContent, right: rightContent} = e.contents;
        writeFileSync(rightUri.fsPath, rightContent, readOptions);
        break;
      default:
        break;
    }
  });
}

function getWebviewContent(left: vscode.Uri, right: vscode.Uri, context: vscode.ExtensionContext) {
  const interpolate = function(str: string, params: {[key: string]: string}) {
    const output = str.replace(/###(.*)###/g, (_, exact) => {
      return params[exact];
    });
    return output;
  };

  const template = readFileSync(join(context.extensionPath, 'src', 'diff', 'index.html'), readOptions);

  const leftContent = readFileSync(left.fsPath, readOptions);
  const rightContent = readFileSync(right.fsPath, readOptions);

  const result = interpolate(template, {
    path: left.fsPath,
    leftContent,
    rightContent,
  });

  return result;
}