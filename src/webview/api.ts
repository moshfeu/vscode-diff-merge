import { Webview } from 'vscode';
import { ExtendedWebviewEnv } from './extendedWebview';

interface IMessage {
  key: string;
  payload?: any;
}

export class API {
  constructor(private webView: Webview) {}

  send(message: IMessage): void {
    this.webView.postMessage(message);
  }

  sendPayload(payload: ExtendedWebviewEnv) {
    this.send({
      key: 'data',
      payload
    });
  }

  sendNextDiff() {
    this.send({
      key: 'nextDiff'
    });
  }

  sendPrevDiff() {
    this.send({
      key: 'prevDiff'
    });
  }

  sendSwap() {
    this.send({
      key: 'swap'
    });
  }
}