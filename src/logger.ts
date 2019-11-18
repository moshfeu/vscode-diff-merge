import { window } from 'vscode';

const logger = window.createOutputChannel('Diff Merge');

export function log(data: object | string) {
  if (typeof data === 'string') {
    logger.appendLine(data);
  } else {
    logger.appendLine(JSON.stringify(data, null, 2));
  }
}