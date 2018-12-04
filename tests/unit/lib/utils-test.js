import { flatten } from 'word-search/lib/word-search/utils';
import { module, test } from 'qunit';

module('Unit | Lib | word-search | utils', function(/* hooks */) {
  test('flatten', function(assert) {
    let expected = [1, 2, 3, 4, 5];

    [
      [1, 2, 3, 4, 5],
      [1, [2, 3], 4, 5],
      [1, 2, [3, 4, 5]],
      [[1], 2, 3, 4, 5],
      [[1, 2, 3, 4, 5]],
      [1, [2], [], [[]], 3, [4, [], [[[]]], 5]]
    ].forEach(actual => {
      assert.deepEqual(
        flatten(actual),
        expected,
        `Expect ${JSON.stringify(actual)} to flatten`
      );
    });
  });
});
