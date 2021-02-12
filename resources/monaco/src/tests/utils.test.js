const assert = require('assert');
const { getChangeOriginalValue } = require('../utils');

describe('getChangeOriginalValue', () => {
  it('\\r + \\n', () => {
    const originalValue = getChangeOriginalValue(
      {
        originalStartLineNumber: 1,
        originalEndLineNumber: 2,
      },
      {
        originalEditor: {
          getValue: () => `<?php\r\ndefine('SUSPECT_THRESHOLD', 0.3);`,
        },
      }
    );
    assert.strictEqual(originalValue.includes('\r'), false);
  });
});
