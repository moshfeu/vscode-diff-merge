import * as vscode from 'vscode';
import {join, relative} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {execSync, ExecSyncOptionsWithStringEncoding} from 'child_process';

const utf8Stream: ExecSyncOptionsWithStringEncoding = {
  encoding: 'utf8'
};

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('diffMerge.scm.file', e => {
    try {
      const rightPath = getFilePath(e.original.fsPath);
      const { leftContent, rightContent } = getSides(rightPath);
      showDiff({ leftContent, rightContent, rightPath, context });
    } catch (error) {
      console.error(error);
    }
  });

  vscode.commands.registerCommand('diffMerge.chooseFile', async (e: vscode.Uri) => {
    const file = await vscode.window.showOpenDialog({});
    if (file) {
      const { fsPath: leftPath } = file[0];
      const { fsPath: rightPath } = e;

      const leftContent = readFileSync(leftPath, utf8Stream);
      const rightContent = readFileSync(rightPath, utf8Stream);
      showDiff({ leftContent, rightContent, leftPath, rightPath, context });
    }
  });
}

function getRootPath(): string {
  return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
}

function getFilePath(path: string): string {
  if (vscode.workspace.workspaceFolders && path.includes(vscode.workspace.workspaceFolders[0].uri.fsPath)) {
    return relative(vscode.workspace.workspaceFolders[0].uri.fsPath, path);
  }
  return path;
}

function showDiff({ leftContent, rightContent, leftPath, rightPath, context }: { leftContent: string; rightContent: string; leftPath?: string; rightPath: string; context: vscode.ExtensionContext; }) {
  const getTitle = () => {
    if (leftPath) {
      return `${getFilePath(leftPath)}↔${getFilePath(rightPath)}`;
    } else {
      return `${getFilePath(rightPath)} (Working Tree)`;
    }
  };

  const panel = vscode.window.createWebviewPanel(
    'mergeDiff.file',
    getTitle(),
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  const UNSAVED_SYMBOL = ' •';
  panel.webview.html = getWebviewContent(leftContent, rightContent, rightPath, context);
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
        writeFileSync(rightPath, rightContent, utf8Stream);
        break;
      default:
        break;
    }
  });
}

function getWebviewContent(leftContent: string, rightContent: string, path: string, context: vscode.ExtensionContext) {
  const interpolate = function(str: string, params: {[key: string]: string}) {
    const output = str.replace(/###(.*)###/g, (_, exact) => {
      return params[exact];
    });
    return output;
  };

  const template = readFileSync(join(context.extensionPath, 'src', 'diff', 'index.html'), utf8Stream);

  const result = interpolate(template, {
    path,
    leftContent,
    rightContent,
  });

  return result;
}

function getSides(path: string) {
  const rootPath = getRootPath();
  let leftContent = '';
  let rightContent;
  try {
    const patch = execSync(`git diff -U1000 ${path}`, {
      ...utf8Stream,
      cwd: rootPath
    });

    if (patch) {
      const onlyCode = patch
        // clear pathc descrition
        .replace(/((.|\n|\r)*)@@\n/g, '')
        // clean path newline
        .replace(/\\ No newline at end of file\n/, '')
        // clean patch indentation
        .replace(/^ /gm, '')
        // remove last line of ""
        .replace(/\n.*$/, '');
      leftContent = onlyCode.replace(/^\+.*\n/gm, '').replace(/^-/gm, '');
      rightContent = onlyCode.replace(/^\-.*\n/gm, '').replace(/^\+/gm, '');
    } else {
      rightContent = readFileSync(`${rootPath}/${path}`, utf8Stream);
    }
  } catch (error) {
    rightContent = readFileSync(`${rootPath}/${path}`, utf8Stream);
  }
  return {leftContent, rightContent};
}