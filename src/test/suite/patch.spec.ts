import * as assert from 'assert';
import { patchToCodes } from '../../patch';

describe('patch', () => {
  it('Both with eof', () => {
    const patch = ` public class Main {
-  bla
+  bla1
 }`;

    const expectedLeftContent = `public class Main {
  bla
}
`;

    const expectedRightContent = `public class Main {
  bla1
}
`;
    const { leftContent, rightContent } = patchToCodes(patch);

    assert.strictEqual(leftContent, expectedLeftContent, 'left');
    assert.strictEqual(rightContent, expectedRightContent, 'right');
  });

  it('Both without eof', () => {
    const patch = ` public class Main {
-  bla
+  bla1
 }
\\ No newline at end of file`;

    const expectedLeftContent = `public class Main {
  bla
}`;

    const expectedRightContent = `public class Main {
  bla1
}`;
    const { leftContent, rightContent } = patchToCodes(patch);

    assert.strictEqual(leftContent, expectedLeftContent, 'left');
    assert.strictEqual(rightContent, expectedRightContent, 'right');
  });

  it('Right without eof', () => {
    const patch = ` public class Main {
-  bla
-}
+  bla1
+}
\\ No newline at end of file`;

    const expectedLeftContent = `public class Main {
  bla
}
`;
    const expectedRightContent = `public class Main {
  bla1
}`;
    const { rightContent, leftContent } = patchToCodes(patch);
    assert.strictEqual(leftContent, expectedLeftContent, 'left');
    assert.strictEqual(rightContent, expectedRightContent, 'right');
  });

  it('Left without eof', () => {
    const patch = ` public class Main {
-  bla
-}
\\ No newline at end of file
+  bla1
+}`;

    const expectedLeftContent = `public class Main {
  bla
}`;
    const expectedRightContent = `public class Main {
  bla1
}
`;
    const { leftContent, rightContent } = patchToCodes(patch);
    assert.strictEqual(leftContent, expectedLeftContent, 'left');
    assert.strictEqual(rightContent, expectedRightContent, 'right');
  });
});
