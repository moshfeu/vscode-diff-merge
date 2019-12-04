import { readFileSync } from 'fs';
import { getRootPath } from './path';
import { execSync } from 'child_process';
import * as istextorbinary from 'istextorbinary';
import { utf8Stream, fileNotSupported } from './constants';

const pathDescription: RegExp = /((.|\n|\r)*)@@\n/g;
const pathNewline: RegExp = /\\ No newline at end of file\n/;
const lastEmptyLine: RegExp = /\n.*$/;
const addedLine: RegExp = /^\+.*[\r\n]*/gm;
const removedLine: RegExp = /^\-.*[\r\n]*/gm;
const addedLineDiffSynmbol: RegExp = /^\+/gm;
const removeLineDiffSynmbol: RegExp = /^-/gm;
const diffIndentation: RegExp = /^ /gm;

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
        .replace(pathDescription, '')
        .replace(pathNewline, '')
        .replace(lastEmptyLine, '');

      leftContent = onlyCode
        .replace(addedLine, '')
        .replace(removeLineDiffSynmbol, '')
        .replace(diffIndentation, '');

      rightContent = onlyCode
        .replace(removedLine, '')
        .replace(addedLineDiffSynmbol, '')
        .replace(diffIndentation, '');
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