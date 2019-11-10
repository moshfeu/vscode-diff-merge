import * as vscode from 'vscode';
import {join} from 'path';
import {readFileSync} from 'fs';

export function activate(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'catCoding',
    'Cat Coding',
    vscode.ViewColumn.One,
    {
      enableScripts: true
    }
  );

  // And set its HTML content
  panel.webview.html = getWebviewContent(context);
}

function getWebviewContent(context: vscode.ExtensionContext) {
  const interpolate = function(str: string, params: object) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${str}\`;`)(...vals);
  };

  const template = readFileSync(join(context.extensionPath, 'src', 'diff', 'index.html'), {
    encoding: 'utf8'
  });

  return interpolate(template, {
    leftContent: 'left from extension!!',
    rightContent: 'right from extension!!',
  });
}