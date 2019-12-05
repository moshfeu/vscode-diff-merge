import { join } from 'path';
import { API } from './api';
import { log } from '../logger';
import { readFileSync } from 'fs';
import { utf8Stream, UNSAVED_SYMBOL } from '../constants';
import { ExtensionContext, Uri, WebviewPanel } from 'vscode';
import { getTitle } from './utils';

interface IExtendedWebviewEnvContentOnly {
  content: string;
}

export interface IExtendedWebviewEnvDiff {
  leftPath?: string;
  rightPath: string;
  leftContent: string;
  rightContent: string;
  fileNotSupported: string;
  theme: any;
}

export type ExtendedWebviewEnv = IExtendedWebviewEnvContentOnly | IExtendedWebviewEnvDiff;

export class ExtendedWebview {
  private _listener?: (e: IpcEvent) => void;
  private _saveListener?: (e: SaveEvent, env: IExtendedWebviewEnvDiff) => Promise<string>;
  public api: API;

  constructor(
    webViewPanel: WebviewPanel,
    templateName: 'notSupported',
    context: ExtensionContext,
    params: ExtendedWebviewEnv,
  );
  constructor(
    webViewPanel: WebviewPanel,
    templateName: 'diff',
    context: ExtensionContext,
    params: ExtendedWebviewEnv,
    mode: ExtendedWebviewMode,
  );
  constructor(
    private webViewPanel: WebviewPanel,
    private templateName: 'diff' | 'notSupported',
    private context: ExtensionContext,
    private params: ExtendedWebviewEnv,
    private mode?: ExtendedWebviewMode,
  ) {
    this.api = new API(webViewPanel.webview);
    this.setPanelTitle();
  }

  onDidReceiveMessage(listener: (e: IpcEvent) => void) {
    this._listener = listener;
  }

  onDidSave(listener: (e: SaveEvent, env: IExtendedWebviewEnvDiff) => Promise<string>) {
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

  private setPanelTitle() {
    const getInitialTitle = () => {
      if ('rightContent' in this.params) {
        const { mode } = this;
        const { leftPath, rightPath, leftContent } = this.params;
        return getTitle(rightPath, mode || 'file', leftPath, !!leftContent);
      }
      return 'File is not supported';
    };
    this.webViewPanel.title = getInitialTitle();
  }

  private async onSave(e: SaveEvent) {
    if ('rightPath' in this.params) {
      let path = this.params.rightPath;
      if (this._saveListener) {
        path = await this._saveListener(e, this.params);
        if (path) {
          this.params.rightPath = path;
          this.setPanelTitle();
        }
      } else {
        log('webview is not listening on "save"');
      }
    }
  }

  render() {
    const { webview } = this.webViewPanel;

    webview.html = this.getTemplate();
    webview.onDidReceiveMessage(async (e: IpcEvent) => {
      switch (e.command) {
        case 'load':
          this.api.sendPayload(this.params);
          break;
        case 'change':
          this.setPanelTitleDraft();
          break;
        case 'save':
          this.onSave(e as SaveEvent);
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