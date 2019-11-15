import * as vscode from 'vscode';
import {join, relative} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const utf8Stream = {
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

function getFilePath(path: string): string {
  if (vscode.workspace.workspaceFolders && path.includes(vscode.workspace.workspaceFolders[0].uri.fsPath)) {
    return relative(vscode.workspace.workspaceFolders[0].uri.fsPath, path);
  }
  return path;
}

function showDiff(leftUri: vscode.Uri, rightUri: vscode.Uri, context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'mergeDiff.file',
    `${getFilePath(leftUri.fsPath)}↔${getFilePath(rightUri.fsPath)}`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  const UNSAVED_SYMBOL = ' •';
  panel.webview.html = getWebviewContent(leftUri, rightUri, context);
  panel.webview.onDidReceiveMessage(e => {
    switch (e.command) {
      case 'change':
        if (!panel.title.includes(UNSAVED_SYMBOL)) {
          panel.title += UNSAVED_SYMBOL;
        }
        break;
      case 'save':
        panel.title = panel.title.replace(UNSAVED_SYMBOL, '');
        const {right: rightContent} = e.contents;
        writeFileSync(rightUri.fsPath, rightContent, utf8Stream);
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

  const template = readFileSync(join(context.extensionPath, 'src', 'diff', 'index.html'), utf8Stream);

  const leftContent = readFileSync(left.fsPath, utf8Stream);
  const rightContent = readFileSync(right.fsPath, utf8Stream);

  const result = interpolate(template, {
    path: left.fsPath,
    leftContent,
    rightContent,
  });

  return result;
}