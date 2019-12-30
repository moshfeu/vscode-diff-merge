import { getFilePath } from './path';
import { showDiff, showNotSupported } from './webview';
import { getGitSides, getExplorerSides } from './content';
import { getActiveDiffPanelWebview } from './webview/store';
import { commands, window, Uri, ExtensionContext } from 'vscode';

export function init(context: ExtensionContext) {
  commands.registerCommand('diffMerge.scm.file', gitDiff);
  commands.registerCommand('diffMerge.blank', blank);
  commands.registerCommand('diffMerge.chooseFile', fileDiff);
  commands.registerCommand('diffMerge.nextDiff', nextDiff);
  commands.registerCommand('diffMerge.prevDiff', prevDiff);
  commands.registerCommand('diffMerge.compareSelected', fileDiff);

  function blank() {
    showDiff({ leftContent: '', rightContent: '', rightPath: '', context });
  }

  function gitDiff(e: {original: Uri}) {
    try {
      const rightPath = getFilePath(e.original.fsPath);
      const { leftContent, rightContent } = getGitSides(rightPath);
      if (rightContent) {
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
    if (list) {
      ([leftPath, currentPath] = list.map(p => p.fsPath));
    } else {
      const file = await window.showOpenDialog({});
      if (file) {
        ({ fsPath: leftPath } = file[0]);
        ({ fsPath: currentPath } = e);
      }
    }

    if (leftPath && currentPath) {
      const rightPath = currentPath ? Uri.parse(currentPath).path : '';

      const { leftContent, rightContent } = getExplorerSides(leftPath, rightPath);
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
}