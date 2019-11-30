import { join } from 'path';
import { API } from './api';
import { log } from '../logger';
import { readFileSync } from 'fs';
import { utf8Stream, UNSAVED_SYMBOL } from '../constants';
import { ExtensionContext, Uri, WebviewPanel } from 'vscode';

export class ExtendedWebview {
  private _listener?: (e: {[key: string]: any}) => void;
  private _saveListener?: (e: {[key: string]: any}) => void;
  public api: API;

  constructor(
    private webViewPanel: WebviewPanel,
    private templateName: 'diff' | 'notSupported',
    private context: ExtensionContext,
    private params: {[key: string]: any},
  ) {
    this.api = new API(webViewPanel.webview);
  }

  onDidReceiveMessage(listener: (e: {[key: string]: any}) => void) {
    this._listener = listener;
  }

  onDidSave(listener: (e: {[key: string]: any}) => void) {
    this._saveListener = listener;
  }

  private getTemplate() {
    if (this.templateName === 'diff') {
      const path = join(this.context.extensionPath, 'resources', 'monaco', 'index.html');
      const file = readFileSync(path, utf8Stream);
      const webviewBaseHref = Uri.file(join(this.context.extensionPath, 'resources', 'monaco'))
                                 .with({ scheme: 'vscode-resource' });

      return file.replace('###base###', `${webviewBaseHref}/`);
    }
    return readFileSync(join(this.context.extensionPath, 'resources', `${this.templateName}.html`), utf8Stream);
  }

  private setPanelTitleDraft() {
    if (!this.webViewPanel.title.includes(UNSAVED_SYMBOL)) {
      this.webViewPanel.title += UNSAVED_SYMBOL;
    }
  }

  private setPanelTitleSaved() {
    this.webViewPanel.title = this.webViewPanel.title.replace(UNSAVED_SYMBOL, '');
  }

  render() {
    const { webview } = this.webViewPanel;

    webview.html = this.getTemplate();
    webview.onDidReceiveMessage(e => {
      switch (e.command) {
        case 'load':
          this.api.sendPayload(this.params);
          break;
        case 'change':
          this.setPanelTitleDraft();
          break;
        case 'save':
          this.setPanelTitleSaved();
          if (this._saveListener) {
            this._saveListener(e);
          } else {
            log('webview is not listening on "save"');
          }
          break;
        default:
          if (this._listener) {
            this._listener(e);
          }
          break;
      }
    });
  }
}