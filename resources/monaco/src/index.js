import './config';
import './style.css';

import * as monaco from 'monaco-editor';

import { render, addDiffActions, swap, layoutDiffContainer, applyAllChanges } from './utils';

const diffEditor = monaco.editor.createDiffEditor(
  document.getElementById('container'),
  {
    originalEditable: true,
  }
);

self.addEventListener('resize', () => {
  if (diffEditor) {
    diffEditor.layout();
    layoutDiffContainer();
  }
});

self.addEventListener('message', (e) => {
  const { diffNavigator } = window;
  const {
    data: { key, payload },
  } = e;
  switch (key) {
    case 'data':
      render(diffEditor, payload);
      break;
    case 'nextDiff':
      diffNavigator.next();
      break;
    case 'prevDiff':
      diffNavigator.previous();
      break;
    case 'swap':
      swap();
      break;
    case 'applyAllChanges':
      applyAllChanges();
      break;
  }
});

self.vscode.postMessage({
  command: 'load',
});

diffEditor.onDidUpdateDiff(() => {
  addDiffActions(diffEditor);
});
