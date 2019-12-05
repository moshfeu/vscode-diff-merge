import { Webview } from 'vscode';
import { ExtendedWebviewEnv } from './extendedWebview';

export class API {
  constructor(private webView: Webview) {}

  sendPayload(payload: ExtendedWebviewEnv) {
    this.webView.postMessage({
      key: 'data',
      payload
    });
  }

  sendNextDiff() {
    this.webView.postMessage({
      key: 'nextDiff'
    });
  }

  sendPrevDiff() {
    this.webView.postMessage({
      key: 'prevDiff'
    });
  }
}