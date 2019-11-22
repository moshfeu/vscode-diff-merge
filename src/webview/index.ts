import { window, ViewColumn, ExtensionContext, Webview } from 'vscode';
import { getFilePath } from '../path';
import { writeFileSync } from 'fs';
import { utf8Stream, UNSAVED_SYMBOL, fileNotSupported } from '../constants';
import { ExtendsWebview } from './extendsWebview';
import { log } from '../logger';

export function showDiff({ leftContent, rightContent, leftPath, rightPath, context }: { leftContent: string; rightContent: string; leftPath?: string; rightPath: string; context: ExtensionContext; }) {
  try {
    const panel = window.createWebviewPanel(
      'mergeDiff.file',
      getTitle(rightPath, leftPath),
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    const extendsWebView = new ExtendsWebview(
      panel.webview,
      'diff',
      context,
      {
        path: rightPath,
        leftContent,
        rightContent,
        fileNotSupported
      }
    );

    extendsWebView.onDidReceiveMessage(e => {
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

    extendsWebView.render();
  } catch (error) {
    log(error);
  }
}

export function showNotSupported(context: ExtensionContext, rightPath: string) {
  const panel = window.createWebviewPanel(
    'mergeDiff.fileNotSupported',
    getTitle(rightPath),
    ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  const extendsWebview = new ExtendsWebview(
    panel.webview,
    'notSupported',
    context,
    {
      content: fileNotSupported
    }
  );
  extendsWebview.render();
}

function getTitle(rightPath: string, leftPath?: string) {
  if (leftPath) {
    return `${getFilePath(leftPath)}↔${getFilePath(rightPath)}`;
  } else {
    return `${getFilePath(rightPath)} (Working Tree)`;
  }
}