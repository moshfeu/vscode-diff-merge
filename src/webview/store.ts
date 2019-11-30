import { ExtendedWebview } from './extendedWebview';

let activeDiffPanelWebview: ExtendedWebview;

export function setActiveDiffPanelWebview(webview: ExtendedWebview) {
  activeDiffPanelWebview = webview;
}

export function getActiveDiffPanelWebview() {
  return activeDiffPanelWebview;
}
