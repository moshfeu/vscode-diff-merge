import { window, ViewColumn, ExtensionContext } from 'vscode';
import { getFilePath } from '../path';
import { writeFileSync, readFileSync } from 'fs';
import { utf8Stream, UNSAVED_SYMBOL, fileNotSupported } from '../constants';
import { join } from 'path';
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

    const template = getTemplate('diff', context);
    panel.webview.html = render(template, {
      rightPath,
      leftContent,
      rightContent,
      fileNotSupported
    });

    log(panel.webview.html);

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
  } catch (error) {
    log(error);
  }
}

export function showNotSupported(context: ExtensionContext, rightPath: string) {
  const panel = window.createWebviewPanel(
    'mergeDiff.fileNotSupported',
    getTitle(rightPath),
    ViewColumn.One,
  );

  panel.webview.html = render(getTemplate('notSupported', context), {
    content: fileNotSupported
  });
}

function getTitle(rightPath: string, leftPath?: string) {
  if (leftPath) {
    return `${getFilePath(leftPath)}↔${getFilePath(rightPath)}`;
  } else {
    return `${getFilePath(rightPath)} (Working Tree)`;
  }
}

function getTemplate(templateName: 'diff' | 'notSupported', context: ExtensionContext) {
  return readFileSync(join(context.extensionPath, 'resources', `${templateName}.html`), utf8Stream);
}

function render(template: string, params: {[key: string]: string}) {
  const output = template.replace(/###(.*)###/g, (_, exact) => {
    return params[exact];
  });
  return output;
}