let cacheActionsLines = [];
let diffActionsNode,
  diffEditor,
  ignoreChange = false;

export function render(
  _diffEditor,
  { rightPath, notSupportedFile, leftContent, rightContent, theme, tabSize }
) {
  diffEditor = _diffEditor;
  window.diffEditor = _diffEditor;
  diffEditor.setModel({
    original: monaco.editor.createModel(
      leftContent,
      null,
      generateMonacoFakeUri(rightPath, 'org')
    ),
    modified: monaco.editor.createModel(
      rightContent,
      null,
      generateMonacoFakeUri(rightPath, 'mod')
    ),
  });
  diffActionsNode = createDiffActionsContainer(diffEditor);
  window.diffNavigator = monaco.editor.createDiffNavigator(diffEditor);
  diffEditor.modifiedEditor.onDidChangeModelContent(onDidUpdateDiff);
  bindSaveShortcut();
  extractEditorStyles(diffEditor);
  setTheme(theme);
  setTabSize(tabSize);
}

function setTabSize(tabSize) {
  const { originalEditor, modifiedEditor } = diffEditor;
  const updateTabSize = (model) =>
    model.updateOptions({ tabSize, detectIndentation: false });
  updateTabSize(originalEditor.getModel());
  updateTabSize(modifiedEditor.getModel());
}

function setEditorValue(editor, value) {
  editor.getModel().setValue(value);
}

export function swap() {
  ignoreChange = true;
  const { originalEditor, modifiedEditor } = diffEditor;
  const leftValue = originalEditor.getValue();
  const rightValue = modifiedEditor.getValue();
  setEditorValue(originalEditor, rightValue);
  setEditorValue(modifiedEditor, leftValue);
}

function generateMonacoFakeUri(path, qs) {
  if (path) {
    const prefixPath = path.startsWith('/') ? '' : '/';
    return monaco.Uri.parse(`vscode://${prefixPath}${path}?${qs}`);
  }
  return null;
}

function onDidUpdateDiff() {
  if (ignoreChange) {
    ignoreChange = !ignoreChange;
    return;
  }
  vscode.postMessage({
    command: 'change',
  });
}

export function addDiffActions(diffEditor) {
  waitForChangesDecorations().then(() => {
    const changes = diffEditor.getLineChanges();
    const changesData = changes.map((change) => ({
      change,
      ...getStrategy(change),
    }));
    const actionsLines = changesData.map(({ top }) => top);
    const actions = Array.from(diffActionsNode.querySelectorAll('.diffAction'));

    changesData.forEach(({ change, top, replacer }) => {
      createOrUpdateDiffAction(diffActionsNode, top, () => {
        const originalLines = getChangeOriginalValue(change, diffEditor);
        applyOriginalLines(originalLines, replacer, diffEditor);
      });
    });
    cacheActionsLines.forEach((actionLine) => {
      if (!actionsLines.includes(actionLine)) {
        diffActionsNode.removeChild(
          actions.find((action) => action.style.top === `${actionLine}px`)
        );
      }
    });
    cacheActionsLines = actionsLines;
  });
}

function getStrategy(change) {
  const isChangeInOriginalSide = change.modifiedEndLineNumber === 0;
  const isChangeInModifiedSide = change.originalEndLineNumber === 0;
  if (isChangeInModifiedSide) {
    return {
      top: diffEditor.modifiedEditor.getTopForLineNumber(
        change.modifiedStartLineNumber
      ),
      replacer: () => {
        const startLine = change.modifiedStartLineNumber - 1;
        return {
          startLine,
          linesToRemove: change.modifiedEndLineNumber - startLine,
        };
      },
    };
  } else if (isChangeInOriginalSide) {
    return {
      top: diffEditor.originalEditor.getTopForLineNumber(
        change.originalStartLineNumber
      ),
      replacer: () => {
        const startLine = change.modifiedStartLineNumber;
        return {
          startLine,
          linesToRemove: 0,
        };
      },
    };
  }
  return {
    top: diffEditor.originalEditor.getTopForLineNumber(
      change.originalStartLineNumber
    ),
    replacer: () => {
      const startLine = change.modifiedStartLineNumber - 1;
      return {
        startLine,
        linesToRemove:
          change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1,
      };
    },
  };
}

function applyOriginalLines(originalLines, replacer, diffEditor) {
  let { startLine, linesToRemove } = replacer();
  const diff = {
    range: new monaco.Range(++startLine, 0, startLine + linesToRemove, 0),
    text: originalLines,
  };
  diffEditor.modifiedEditor.executeEdits('diff-merge', [diff]);
}

function getChangeOriginalValue(change, diffEditor) {
  return diffEditor.originalEditor
    .getValue()
    .split(/(?<=[\n\r])/gm)
    .slice(change.originalStartLineNumber - 1, change.originalEndLineNumber)
    .join('');
}

function createOrUpdateDiffAction(diffActionsNode, top, onCopy) {
  // action is already in place
  if (cacheActionsLines.includes(top)) {
    const action = diffActionsNode.querySelector(
      `.diffAction[data-top="${top}"]`
    );
    action.onclick = onCopy;
  } else {
    const action = document.createElement('div');
    action.className = 'diffAction';
    action.dataset.top = top;
    action.innerHTML = '→';
    action.style.top = `${top}px`;
    action.onclick = onCopy;
    diffActionsNode.appendChild(action);
  }
}

export function layoutDiffContainer(diffActions = diffActionsNode) {
  const modifedEditorNode = diffEditor.modifiedEditor.getDomNode();
  diffActions.style.left = `${
    modifedEditorNode.getBoundingClientRect().left
  }px`;
}

function createDiffActionsContainer(diffEditor) {
  const diffActions = document.createElement('div');
  diffActions.className = 'diffActions diffOverview';
  diffActions.style.height = `${diffEditor.originalEditor.getScrollHeight()}px`;
  document.querySelector('#container').appendChild(diffActions);

  diffEditor.modifiedEditor.onDidScrollChange(({ scrollTop }) => {
    diffActions.style.top = `-${scrollTop}px`;
  });
  layoutDiffContainer(diffActions);
  return diffActions;
}

function waitForChangesDecorations() {
  let i;
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const isDiffApplyed = document.querySelector('.cdr');
      if (isDiffApplyed) {
        clearInterval(interval);
        resolve();
      } else if (i > 200) {
        clearInterval(interval);
        reject();
      }
    }, 10);
  });
}

function isSaveShortcut(e) {
  return (
    (window.navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey) &&
    e.keyCode == 83
  );
}

function bindSaveShortcut() {
  document.addEventListener(
    'keydown',
    (e) => {
      if (isSaveShortcut(e)) {
        e.preventDefault();
        vscode.postMessage({
          command: 'save',
          contents: {
            left: diffEditor.originalEditor.getValue(),
            right: diffEditor.modifiedEditor.getValue(),
          },
        });
      }
    },
    false
  );
}

function extractEditorStyles(diffEditor) {
  const lineHeight = diffEditor.modifiedEditor.getOption(
    monaco.editor.EditorOption.lineHeight
  );
  document.body.style.setProperty('--diff-merge-lineheight', `${lineHeight}px`);
}

function setTheme(theme) {
  if (!theme) {
    return;
  }
  monaco.editor.defineTheme('vscodeTheme', theme);
  monaco.editor.setTheme('vscodeTheme');
}

function retrieveCssVariables() {
  const isNumber = (s) => !isNaN(Number(s));

  const htmlTag = document.querySelector('html');
  const compotedStyle = getComputedStyle(htmlTag);

  return Object.keys(htmlTag.style)
    .filter(isNumber)
    .reduce((ol, ne) => {
      ol[htmlTag.style[ne]] = compotedStyle.getPropertyValue(htmlTag.style[ne]);
      return ol;
    }, {});
}
