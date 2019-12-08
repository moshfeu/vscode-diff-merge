import './config';
import './style.css';

import * as monaco from 'monaco-editor';

import {render, addDiffActions} from './utils';

const diffEditor = monaco.editor.createDiffEditor(
  document.getElementById('container')
);

self.addEventListener('resize', () => {
  if (diffEditor) {
    diffEditor.layout();
  }
});

self.addEventListener('message', e => {
  const { diffNavigator } = window;
  const {
    data: { key, payload }
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
  }
});

self.vscode.postMessage({
  command: 'load'
});

diffEditor.onDidUpdateDiff(() => {
  addDiffActions(diffEditor);
});