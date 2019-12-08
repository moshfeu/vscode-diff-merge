self.vscode = acquireVsCodeApi ? acquireVsCodeApi() : self.parent;

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './dist/json.worker.bundle.js';
    }
    if (label === 'css') {
      return './dist/css.worker.bundle.js';
    }
    if (label === 'html') {
      return './dist/html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './dist/ts.worker.bundle.js';
    }
    return './dist/editor.worker.bundle.js';
  }
}
