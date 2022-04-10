import { commands, window, Range, Position } from 'vscode';
import { convertToMonacoTheme } from './adapter';
import { log } from '../logger';

let _theme: {[key: string]: any} | undefined;
async function extractCurrentThemeSchema(): Promise<string> {
  await commands.executeCommand('workbench.action.generateColorTheme');
  if (window.activeTextEditor) {
    const text = window.activeTextEditor.document.getText();
    // clean the editor so when it asked to close it will not ask the user if they want to save the file
    await window.activeTextEditor.edit(editor => editor.delete(new Range(new Position(0, 0), new Position(10000, 100000))));
    commands.executeCommand('workbench.action.closeActiveEditor');
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