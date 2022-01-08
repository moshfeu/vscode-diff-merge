import { getFilePath } from './path';
import { showDiff, showNotSupported } from './webview';
import { getGitSides, getExplorerSides, getContentOrFallback } from './content';
import { getActiveDiffPanelWebview } from './webview/store';
import { commands, window, Uri, ExtensionContext, env } from 'vscode';
import { log } from './logger';

export function init(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('diffMerge.scm.file', gitDiff),
    commands.registerCommand('diffMerge.blank', blank),
    commands.registerCommand('diffMerge.chooseFile', fileDiff),
    commands.registerCommand('diffMerge.nextDiff', nextDiff),
    commands.registerCommand('diffMerge.prevDiff', prevDiff),
    commands.registerCommand('diffMerge.compareSelected', fileDiff),
    commands.registerCommand('diffMerge.swap', swap),
    commands.registerCommand('diffMerge.selectToCompare', selectToCompare),
    commands.registerCommand(
      'diffMerge.compareWithSelected',
      compareWithSelected
    ),
    commands.registerCommand(
      'diffMerge.compareFileWithClipboard',
      compareFileWithClipboard
    )
  );

  async function compareFileWithClipboard() {
    const { document } = window.activeTextEditor || {};
    if (!document) {
      window.showInformationMessage(
        'This command has to be run only when a text based file is open'
      );
      log('This command has to be run only when a file is open');
      return;
    }
    showDiff({
      context,
      leftContent: await env.clipboard.readText(),
      leftPath: 'Clipboard',
      rightPath: document.uri.fsPath,
      rightContent: document.getText(),
    });
  }

  function blank() {
    showDiff({ leftContent: '', rightContent: '', rightPath: '', context });
  }

  function gitDiff(e: { resourceUri: Uri }) {
    try {
      const rightPath = getFilePath(e.resourceUri.fsPath);
      const { leftContent, rightContent } = getGitSides(rightPath);
      if (rightContent || leftContent) {
        showDiff({ leftContent, rightContent, rightPath, context });
      } else {
        showNotSupported(context, rightPath, 'git');
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fileDiff(e: Uri, list?: Uri[]) {
    let leftPath, currentPath;
    if (list && list.length > 1) {
      [leftPath, currentPath] = list.map((p) => p.fsPath);
    } else {
      const file = await window.showOpenDialog({});
      if (file) {
        ({ fsPath: leftPath } = file[0]);
        ({ fsPath: currentPath } = e);
      }
    }

    if (leftPath && currentPath) {
      const rightPath = currentPath ? Uri.parse(currentPath).path : '';

      const { leftContent, rightContent } = getExplorerSides(
        leftPath,
        rightPath
      );
      showDiff({ leftContent, rightContent, leftPath, rightPath, context });
    }
  }

  function nextDiff() {
    const webview = getActiveDiffPanelWebview();
    webview.api.sendNextDiff();
  }

  function prevDiff() {
    const webview = getActiveDiffPanelWebview();
    webview.api.sendPrevDiff();
  }

  function swap() {
    const webview = getActiveDiffPanelWebview();
    webview.swap();
  }

  let selectedFilePath: string;
  function selectToCompare(e: Uri) {
    try {
      selectedFilePath = tryToGetPath(e);
      commands.executeCommand('setContext', 'diffMergeFileSelected', true);
    } catch (error) {
      // ignore
    }
  }

  async function compareWithSelected(e: Uri) {
    try {
      const rightPath = tryToGetPath(e);
      if (!selectedFilePath) {
        log(
          `Somehow the user is able to "compare with selected without selecting a file first.\nSelected file path: ${selectedFilePath}`
        );
        const whatHappened = await window.showErrorMessage(
          'Have you selected a file to compare? ',
          'I did, let me open an issue',
          'I forgot'
        )
        if (
          (whatHappened) === 'I did, let me open an issue'
        ) {
          env.openExternal(
            Uri.parse('https://github.com/moshfeu/vscode-diff-merge/issues/new')
          );
        }
        return;
      }
      showDiff({
        context,
        leftContent: getContentOrFallback(selectedFilePath),
        leftPath: selectedFilePath,
        rightPath,
        rightContent: getContentOrFallback(rightPath),
      });
    } catch (error) {
      log(`There is a problem to compare with selected: ${error}`);
    }
  }
}

function tryToGetPath(e: Uri) {
  if (e) {
    return e.fsPath;
  }
  if (window.activeTextEditor?.document.uri.fsPath) {
    return window.activeTextEditor?.document.uri.fsPath;
  }
  window.showWarningMessage('No file selected');
  throw new Error('No file selected');
}
