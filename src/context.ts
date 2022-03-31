import { commands } from 'vscode';

export function setPanelFocused(focused: boolean) {
  commands.executeCommand('setContext', 'diffMerge.panelFocused', focused);
}

export function setHasChanges(hasChanges: boolean) {
  commands.executeCommand('setContext', 'diffMerge.hasChanges', hasChanges);
}