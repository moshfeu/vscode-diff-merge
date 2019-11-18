import { getRootPath } from './path';
import { execSync } from 'child_process';
import { utf8Stream, fileNotSupported } from './constants';
import { readFileSync } from 'fs';
import * as istextorbinary from 'istextorbinary';

export function getExplorerSides(leftPath: string, rightPath: string) {
  const leftContent = getContentOrFallback(leftPath) || fileNotSupported;
  const rightContent = getContentOrFallback(rightPath) || fileNotSupported;

  return {leftContent, rightContent};
}

export function getGitSides(path: string) {
  const rootPath = getRootPath();
  let leftContent = '';
  let rightContent;
  try {
    const patch = execSync(`git diff -U1000 ${path}`, {
      ...utf8Stream,
      cwd: rootPath
    });

    if (patch) {
      const onlyCode = patch
        // clear pathc descrition
        .replace(/((.|\n|\r)*)@@\n/g, '')
        // clean path newline
        .replace(/\\ No newline at end of file\n/, '')
        // clean patch indentation
        .replace(/^ /gm, '')
        // remove last line of ""
        .replace(/\n.*$/, '');

      leftContent = onlyCode.replace(/^\+.*\n/gm, '').replace(/^-/gm, '');
      rightContent = onlyCode.replace(/^\-.*\n/gm, '').replace(/^\+/gm, '');
    } else {
      rightContent = getContentOrFallback(`${rootPath}/${path}`);
    }
  } catch (error) {
    rightContent = getContentOrFallback(`${rootPath}/${path}`);
  }

  return {leftContent, rightContent};
}

function getContentOrFallback(path: string) {
  const content = readFileSync(path);
  if (!istextorbinary.isTextSync(undefined, content)) {
    return '';
  }
  return content.toString(utf8Stream.encoding);
}