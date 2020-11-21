const pathDescription: RegExp = /((.|\n|\r)*)@@\n/g;
const eof = /\n$/;

type Line = {
  added: boolean;
  removed: boolean;
  eof: boolean;
  code: string;
};

type LineType = keyof Pick<Line, 'added' | 'removed'>;
type Side = 'left' | 'right';

const eofR = /\\ No newline at end of file/;

export function patchToCodes(patch: string) {
  const onlyCode = patch.replace(pathDescription, '').replace(eof, '');
  const patchHasEof = !patch.match(eofR);

  const lines = onlyCode.split('\n').map((line) => ({
    added: line.startsWith('+'),
    removed: line.startsWith('-'),
    code: line.substr(1, line.length),
    eof: !!line.match(eofR),
  }));

  const extractSide = (side: Side) => {
    const lineTypeToRemove: LineType = side === 'left' ? 'added' : 'removed';
    const sideHasEof = !!lines[lines.findIndex((l) => l.eof) - 1]?.[
      lineTypeToRemove
    ];

    const sideLines = lines.reduce<string[]>((acc, curr, idx) => {
      if (curr[lineTypeToRemove] || curr.eof) {
        return acc;
      }
      return [...acc, curr.code];
    }, []);
    if (patchHasEof || sideHasEof) {
      sideLines.push('');
    }

    return sideLines.join('\n');
  };

  const leftContent = extractSide('left');
  const rightContent = extractSide('right');

  return {
    leftContent,
    rightContent,
  };
}
