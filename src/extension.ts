import { init } from './commands';
import { ExtensionContext } from 'vscode';

export function activate(context: ExtensionContext) {
  init(context);
}