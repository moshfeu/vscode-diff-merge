import { appendFileSync, writeFileSync } from 'fs';
import path from 'path';

const pathDescription: RegExp = /((.|\n|\r)*)@@\n/g;
const pathNewline: RegExp = /\\ No newline at end of file[\n]*/gm;
const lastEmptyLine: RegExp = /^\s*\z$/gm;
const eol = /\n$/;
const addedLine: RegExp = /^\+.*[\r\n]*/gm;
const removedLine: RegExp = /^\-.*[\r\n]*/gm;
const addedLineDiffSynmbol: RegExp = /^\+/gm;
const removeLineDiffSynmbol: RegExp = /^-/gm;
const diffIndentation: RegExp = /^ /gm;
const noNewLine = '(\n\\\\ No newline at end of file)';
const noNewLineLeft = new RegExp(`${noNewLine}\n`);
const noNewLineRight = new RegExp(`${noNewLine}$`);

export function patchToCodes(patch: string) {
  const onlyCode = patch.replace(pathDescription, '').replace(eol, '');
  const p = path.join(__dirname, 'log.txt');
  writeFileSync(p, '', { encoding: 'utf8' });

  const l = (str: string) => {
    appendFileSync(p, '\n------\n' + str, { encoding: 'utf8' });
    return str;
  };

  let leftContent = onlyCode
    .replace(addedLine, '')
    .replace(removeLineDiffSynmbol, ' ')
    .replace(diffIndentation, '')
    .replace(noNewLineRight, '\n')
    .replace(noNewLineLeft, '');

  let rightContent = onlyCode
    .replace(removedLine, '')
    .replace(addedLineDiffSynmbol, ' ')
    .replace(diffIndentation, '')
    .replace(noNewLineRight, '')
    .replace(noNewLineLeft, '\n');

  if (!onlyCode.match(new RegExp(noNewLine))) {
    rightContent += '\n';
    leftContent += '\n';
  }

  return {
    leftContent,
    rightContent,
  };
}
