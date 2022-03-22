import { getFilePath } from './path';
import { showDiff, showNotSupported } from './webview';
import { getGitSides, getExplorerSides, getContentOrFallback } from './content';
import { getActiveDiffPanelWebview } from './webview/store';
import { commands, window, Uri, ExtensionContext, env, TextEditor } from 'vscode';
import { log } from './logger';
import { takeWhile, takeRightWhile } from 'lodash';

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
    ),
    commands.registerCommand('diffMerge.openWithDiffMerge', reopenCurrentWithDiffMerge),
  );

  async function reopenCurrentWithDiffMerge() {
    const editor = window.activeTextEditor;
    if (!editor) return;
    const visibleEditors = window.visibleTextEditors;
    const editorIndex = visibleEditors.indexOf(editor);
    // This might not be always true. But it's the only way I can think of how to know whether it's a diff-editor.
    const supportedSchemes = ['file', 'git', 'gitlens', 'git-graph'];
    const isDiffEditor = (editor: TextEditor) => editor.viewColumn === undefined && supportedSchemes.includes(editor.document.uri.scheme);
    // In case multiple diff-editors are open, we need to find the correct one.
    const diffEditors =
      takeRightWhile(visibleEditors.slice(undefined, editorIndex + 1), isDiffEditor)
        .concat(takeWhile(visibleEditors.slice(editorIndex + 1), isDiffEditor));
    const editorIndexInDiffEditors = diffEditors.indexOf(editor);
    // Get the editors content.
    const leftEditorIndex = Math.trunc(editorIndexInDiffEditors / 2) * 2;
    const [leftEditor, rightEditor] = diffEditors.slice(leftEditorIndex, leftEditorIndex + 2);
    if (leftEditor.document.uri.scheme === 'git') {
      return gitDiff({ resourceUri: leftEditor.document.uri });
    }
    if (leftEditor.document.uri.scheme === 'gitlens') {
      const gitlensInfo = JSON.parse(leftEditor.document.uri.query) as { ref: string };
      return gitDiff({ resourceUri: leftEditor.document.uri, ref: gitlensInfo.ref });
    }
    if (leftEditor.document.uri.scheme === 'git-graph') {
      const gitGraphInfoBase64 = leftEditor.document.uri.query;
      type GitGraphInfo = { commit: string, repo: string, filePath: string };
      const gitGraphInfo = JSON.parse(Buffer.from(gitGraphInfoBase64, 'base64').toString()) as GitGraphInfo;
      const path = Uri.joinPath(Uri.file(gitGraphInfo.repo), gitGraphInfo.filePath);
      return gitDiff({ resourceUri: path, ref: gitGraphInfo.commit });
    }
    else {
      const leftContent = leftEditor.document.getText();
      const leftPath = leftEditor.document.uri.fsPath;
      const rightContent = rightEditor.document.getText();
      const rightPath = rightEditor.document.uri.fsPath;
      return showDiff({ leftContent, rightContent, leftPath, rightPath, context });
    }
  }

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

  function gitDiff(e: { resourceUri: Uri, ref?: string }) {
    try {
      const rightPath = getFilePath(e.resourceUri.fsPath);
      const { leftContent, rightContent } = getGitSides(rightPath, { ref: e.ref });
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
      log(`file selected: ${selectedFilePath || 'no file selected'}`);
      commands.executeCommand('setContext', 'diffMergeFileSelected', true);
    } catch (error) {
      log(error as object)
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
    return window.activeTextEditor.document.uri.fsPath;
  }
  window.showWarningMessage('No file selected');
  throw new Error('No file selected');
}
