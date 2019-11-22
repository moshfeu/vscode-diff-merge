import { Webview, Event, ExtensionContext } from 'vscode';
import { readFileSync } from 'fs';
import { join } from 'path';
import { utf8Stream } from '../constants';

export class ExtendsWebview {
  private _listener?: (e: {[key: string]: any}) => void;

  constructor(
    private webView: Webview,
    private templateName: 'diff' | 'notSupported',
    private context: ExtensionContext,
    private params: {[key: string]: string},
  ) {

  }

  private getTemplate(templateName: 'diff' | 'notSupported', context: ExtensionContext) {
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
      } else {
        if (this._listener) {
          this._listener(e);
        }
      }
    });
  }
}