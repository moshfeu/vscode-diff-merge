import { commands, window } from 'vscode';
import { convertToMonacoTheme } from './adapter';
import { log } from '../logger';

let _theme: {[key: string]: any} | undefined;
async function extractCurrentThemeSchema(): Promise<string> {
  await commands.executeCommand('workbench.action.generateColorTheme');
  if (window.activeTextEditor) {
    const text = window.activeTextEditor.document.getText();
    window.activeTextEditor.hide();
    return text;
  }
  return '';
}

export async function extract() {
  if (!_theme) {
    const schema = await extractCurrentThemeSchema();
    if (schema) {
      _theme = convertToMonacoTheme(schema);
    } else {
      log(`can't extract monaco theme :(`);
    }
  }
  return _theme;
}