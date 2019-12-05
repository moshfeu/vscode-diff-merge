import { getFilePath } from '../path';

export function getTitle(rightPath: string, mode: ExtendedWebviewMode, leftPath?: string, leftHasContent: boolean = false) {
  if (leftPath) {
    return `${getFilePath(leftPath)} ↔ ${getFilePath(rightPath)}`;
  } else if (!rightPath) {
    // blank diff view
    return 'Untitled';
  } else if (mode === 'git') {
    const gitStatus = leftHasContent ? 'Working Tree' : 'Untracked';
    return `${getFilePath(rightPath)} (${gitStatus})`;
  } else {
    return getFilePath(rightPath);
  }
}