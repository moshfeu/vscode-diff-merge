import { commands, window, Uri, ExtensionContext } from 'vscode';
import { showDiff, showNotSupported } from './webview';
import { getFilePath } from './path';
import { getGitSides, getExplorerSides } from './content';

export function init(context: ExtensionContext) {
  commands.registerCommand('diffMerge.scm.file', e => {
    try {
      const rightPath = getFilePath(e.original.fsPath);
      const { leftContent, rightContent } = getGitSides(rightPath);
      if (rightContent) {
        showDiff({ leftContent, rightContent, rightPath, context });
      } else {
        showNotSupported(context, rightPath);
      }
    } catch (error) {
      console.error(error);
    }
  });

  commands.registerCommand('diffMerge.chooseFile', async (e: Uri) => {
    const file = await window.showOpenDialog({});
    if (file) {
      const { fsPath: leftPath } = file[0];
      const { fsPath: rightPath } = e;

      const { leftContent, rightContent } = getExplorerSides(leftPath, rightPath);
      showDiff({ leftContent, rightContent, leftPath, rightPath, context });
    }
  });
}