/// <reference path="node_modules/monaco-editor/monaco.d.ts" />

interface Window {
  diffNavigator: monaco.editor.IDiffNavigator;
  diffEditor: monaco.editor.IStandaloneDiffEditor;
}
