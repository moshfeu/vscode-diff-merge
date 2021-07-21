const COMMENTED_LINE_REGEX = /^.*\/\/.*$\n/gm;
const TRALING_COMMA_REGEX = /\,(?=\s*?[\}\]])/g;


export function convertToMonacoTheme(text: string) {
  try {
    const vscodeTheme = JSON.parse(
      text
        .replace(COMMENTED_LINE_REGEX, '')
        .replace(TRALING_COMMA_REGEX, '')
    );

    const rules = vscodeTheme.tokenColors.map((c: {scope: any, settings: any}) => ({
      token: Array.isArray(c.scope) ? c.scope.join(' ') : c.scope,
      ...cleanHashFromValues(c),
    }));

    const theme = {
      base: vscodeTheme.type === 'dark' ? 'vs-dark' : 'vs',
      inherit: true,
      colors: vscodeTheme.colors,
      rules,
    };

    return theme;
  } catch (error) {
    console.log(error);
  }
}

function cleanHashFromValues(values: {settings: []}) {
  return JSON.parse(
    JSON.stringify(values.settings)
        .replace(/"#(.*?)"/gm, '"$1"')
  );
}