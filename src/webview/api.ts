import { Webview } from 'vscode';

export class API {
  constructor(private webView: Webview) {}

  sendPayload(payload: {[key: string]: any}) {
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