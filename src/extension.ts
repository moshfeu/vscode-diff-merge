import { init } from './commands';
import { ExtensionContext } from 'vscode';
import { log } from './logger';

export function activate(context: ExtensionContext) {
  init(context);
  log(process.env);
}