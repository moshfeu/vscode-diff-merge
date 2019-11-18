import * as vscode from 'vscode';
import { init } from './commands';

export function activate(context: vscode.ExtensionContext) {
  init(context);
}