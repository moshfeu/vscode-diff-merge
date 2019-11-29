import { Webview, Event, ExtensionContext, Uri } from 'vscode';
import { readFileSync } from 'fs';
import { join } from 'path';
import { utf8Stream } from '../constants';

export class ExtendsWebview {
  private _listener?: (e: {[key: string]: any}) => void;

  constructor(
    private webView: Webview,
    private templateName: 'diff' | 'notSupported',
    private context: ExtensionContext,
    private params: {[key: string]: any},
  ) {

  }

  private getTemplate(templateName: 'diff' | 'notSupported', context: ExtensionContext) {
    if (templateName === 'diff') {
      return readFileSync(join(context.extensionPath, 'resources', 'monaco', 'index.html'), utf8Stream)
        .replace('###base###', `${Uri.file(join(context.extensionPath, 'resources', 'monaco')).with({ scheme: 'vscode-resource' })}/`);
    }
    return readFileSync(join(context.extensionPath, 'resources', `${templateName}.html`), utf8Stream);
  }

  onDidReceiveMessage(listener: (e: {[key: string]: any}) => void) {
    this._listener = listener;
  }

  render() {
    this.webView.html = this.getTemplate(this.templateName, this.context);
    this.webView.onDidReceiveMessage(e => {
      if (e.command === 'load') {
        this.webView.postMessage({
          key: 'data',
          payload: this.params
        });
      } else if (this._listener) {
        this._listener(e);
      }
    });
  }
}