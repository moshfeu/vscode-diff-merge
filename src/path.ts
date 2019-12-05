import { relative, isAbsolute } from 'path';
import { workspace } from 'vscode';

export function getRootPath(): string {
  return workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : '';
}

export function getFilePath(path: string): string {
  if (workspace.workspaceFolders && path.includes(workspace.workspaceFolders[0].uri.fsPath)) {
    return relative(workspace.workspaceFolders[0].uri.fsPath, path);
  }
  return path;
}

export function getSafeFsPath(path: string): string {
  if (isAbsolute(path)) {
    return path;
  }
  return `${getRootPath()}/${getFilePath(path)}`;
}