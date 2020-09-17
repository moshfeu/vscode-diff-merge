import { existsSync } from 'fs';
import { join } from 'path';
import { getRootPath } from './path';

export function isGit() {
  return existsSync(join(getRootPath(), '.git'));
}

export function isSvn() {
  return existsSync(join(getRootPath(), '.svn'));
}
