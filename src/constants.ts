import { ExecSyncOptionsWithStringEncoding } from 'child_process';
import { getRootPath } from './path';

export const UNSAVED_SYMBOL = ' •';
export const fileNotSupported = `The file is not displayed in the editor because it is either binary, uses an unsupported text encoding or it's an empty file`;
export const utf8Stream: ExecSyncOptionsWithStringEncoding = {
  encoding: 'utf8',
};
export const cwdCommandOptions = {
  ...utf8Stream,
  cwd: getRootPath(),
};
