import { log } from '../logger';
import { writeFileSync } from 'fs';
import { setPanelFocused } from '../context';
import { getSafeFsPath } from '../path';
import { setActiveDiffPanelWebview } from './store';
import { ExtendedWebview, ExtendedWebviewEnv, IExtendedWebviewEnvDiff } from './extendedWebview';
import { utf8Stream, fileNotSupported } from '../constants';
import { window, ViewColumn, ExtensionContext, workspace } from 'vscode';
import { extract } from '../theme/extractor';
import { getTitle } from './utils';

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
    const options = {
      enableScripts: true,
      retainContextWhenHidden: true,
    };

    const panel = window.createWebviewPanel(
      'diffMerge',
      '',
      column,
      options
    );

    const theme = await extract();
    const { tabSize, fontFamily, fontSize } = workspace.getConfiguration('editor');

    const webviewEnv: ExtendedWebviewEnv = {
      leftPath,
      rightPath,
      leftContent,
      rightContent,
      fileNotSupported,
      theme,
      styles: {
        tabSize,
        fontFamily,
        fontSize,
      }
    };

    const extendsWebView = new ExtendedWebview(
      panel,
      'diff',
      context,
      webviewEnv,
      'file',
    );

    extendsWebView.onDidSave(async (e: SaveEvent, env: IExtendedWebviewEnvDiff) => {
      try {
        const {right: rightContent} = e.contents;
        const savedRightPath = await getSaveRightPath(env.rightPath);
        if (savedRightPath) {
          writeFileSync(getSafeFsPath(savedRightPath), rightContent, utf8Stream);
          return savedRightPath;
        }
        return '';
      } catch (error) {
        log(`Error: can't save file due "${error}"`);
        return '';
      }
    });

    extendsWebView.render();
    panel.onDidChangeViewState(e => {
      setPanelFocused(e.webviewPanel.active);
      log(`panel visibility changed to: ${e.webviewPanel.active}`);
      // don't need to worry when it's not active becuase the diff navigator's buttons will be invisible
      if (e.webviewPanel.active) {
        setActiveDiffPanelWebview(extendsWebView);
      }
    });
    panel.onDidDispose(() => {
      log('panel disposed');
      setPanelFocused(false);
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

async function getSaveRightPath(path: string): Promise<string> {
  if (!path) {
    const uri = await window.showSaveDialog({});
    if (uri) {
      path = uri.fsPath;
    }
  }
  return path;
}

export function showNotSupported(context: ExtensionContext, rightPath: string, mode: ExtendedWebviewMode) {
  const title = getTitle(rightPath, mode);
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