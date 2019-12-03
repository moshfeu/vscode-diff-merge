import { join } from 'path';
import { log } from '../logger';
import { writeFileSync } from 'fs';
import { setPanelFocused } from '../context';
import { getFilePath, getRootPath } from '../path';
import { setActiveDiffPanelWebview } from './store';
import { ExtendedWebview, ExtendedWebviewEnv } from './extendedWebview';
import { utf8Stream, fileNotSupported } from '../constants';
import { window, ViewColumn, ExtensionContext, Uri } from 'vscode';
import { extract } from '../theme/extractor';

interface IDiffData {
  leftContent: string;
  rightContent: string;
  leftPath?: string;
  rightPath: string;
  context: ExtensionContext;
}

const column = ViewColumn.One;

export async function showDiff({ leftContent, rightContent, leftPath, rightPath, context }: IDiffData) {
  try {
    const rightPathUri = Uri.parse(rightPath);
    const title = getTitle(rightPath, leftPath, !!leftContent);
    const options = {
      enableScripts: true,
      retainContextWhenHidden: true,
    };

    const panel = window.createWebviewPanel(
      'diffMerge',
      title,
      column,
      options
    );

    const theme = await extract();

    const webviewEnv: ExtendedWebviewEnv = {
      path: `vscode://${rightPathUri.path}`, // can use any URI schema
      leftContent,
      rightContent,
      fileNotSupported,
      theme
    };

    const extendsWebView = new ExtendedWebview(
      panel,
      'diff',
      context,
      webviewEnv
    );

    extendsWebView.onDidSave(e => {
      try {
        const {right: rightContent} = e.contents;
        const rightFsPath = join(getRootPath(), getFilePath(rightPath));
        writeFileSync(rightFsPath, rightContent, utf8Stream);
      } catch (error) {
        log(`Error: can't save file due "${error}"`);
      }
    });

    extendsWebView.render();
    panel.onDidChangeViewState(e => {
      setPanelFocused(e.webviewPanel.active);
      // don't need to worry when it's not active becuase the diff navigator's buttons will be invisible
      if (e.webviewPanel.active) {
        setActiveDiffPanelWebview(extendsWebView);
      }
    });
    // ugly, I know. The case is when opening new diff view, with the timeout, the new panel will wait fot the previous panel to set focus out
    setTimeout(() => {
      setPanelFocused(true);
      setActiveDiffPanelWebview(extendsWebView);
    }, 100);
  } catch (error) {
    log(error);
  }
}

export function showNotSupported(context: ExtensionContext, rightPath: string) {
  const title = getTitle(rightPath);
  const options = {
    enableScripts: true,
  };
  const panel = window.createWebviewPanel(
    'mergeDiff.fileNotSupported',
    title,
    column,
    options
  );

  const webviewEnv: ExtendedWebviewEnv = {
    content: fileNotSupported
  };

  const extendsWebview = new ExtendedWebview(
    panel,
    'notSupported',
    context,
    webviewEnv
  );
  extendsWebview.render();
}

function getTitle(rightPath: string, leftPath?: string, leftHasContent: boolean = false) {
  if (leftPath) {
    return `${getFilePath(leftPath)} ↔ ${getFilePath(rightPath)}`;
  } else {
    const gitStatus = leftHasContent ? 'Working Tree' : 'Untracked';
    return `${getFilePath(rightPath)} (${gitStatus})`;
  }
}