import Game from 'word-search/lib/word-search';
import { module, test } from 'qunit';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXY'.split('');

module('Unit | Lib | word-search', function(/* hooks */) {
  test('it instantiates with expected props', function(assert) {
    let game = new Game();
    assert.equal(game.letters.length, 25, 'correct number of letters');
  });

  test('all squares initially selectable', function(assert) {
    let g = new Game();
    assert.equal(
      g.selectableSquares.length,
      25,
      'all squares are initially selectable'
    );
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        assert.ok(g.isSelectable(r, c), `${r},${c} is selectable`);
      }
    }
  });
  test('selectable squares update after selection', function(assert) {
    let g = new Game(LETTERS);
    g.toggleSelect(0, 0);

    assert.equal(
      g.selectableSquares.length,
      3,
      'selectable squares are updated'
    );
    assert.ok(!g.isSelectable(0, 0), '0,0 is not selectable');
    assert.ok(g.isSelectable(0, 1), '0,1 is selectable');
    assert.ok(g.isSelectable(1, 1), '1,1 is selectable');
    assert.ok(g.isSelectable(1, 0), '1,0 is selectable');

    assert.equal(g.stack.toString(), 'A');

    g.toggleSelect(0, 1);
    assert.equal(
      g.selectableSquares.length,
      4,
      'selectable squares are updated again'
    );
    assert.equal(g.stack.toString(), 'AB');

    assert.ok(!g.isSelectable(0, 0), '0,0 is not selectable');
    assert.ok(!g.isSelectable(0, 1), '0,1 is not selectable');
    assert.ok(g.isSelectable(0, 2), '0,2 is selectable');
    assert.ok(g.isSelectable(1, 2), '1,2 is selectable');
    assert.ok(g.isSelectable(1, 1), '1,1 is selectable');
    assert.ok(g.isSelectable(1, 0), '1,0 is selectable');
  });
  test('deselecting squares', function(assert) {
    let g = new Game(LETTERS);
    g.toggleSelect(0, 0);
    g.toggleSelect(0, 0);
    assert.equal(g.selectableSquares.length, 25, 'all squares selectable');
    assert.equal(
      g.squares.toArray().filter(s => s.selected).length,
      0,
      'no squares selected'
    );
    assert.equal(g.stack.toString(), '');

    g.toggleSelect(0, 0);
    g.toggleSelect(0, 1);
    g.toggleSelect(0, 2);
    assert.equal(g.stack.toString(), 'ABC');
    g.toggleSelect(0, 2);
    assert.equal(g.stack.toString(), 'AB');
    assert.equal(
      g.selectableSquares.length,
      4,
      'correct number of selectable squares'
    );
    assert.ok(!g.isSelectable(0, 0), '0,0 is not selectable (it is selected)');
    assert.ok(!g.isSelectable(0, 1), '0,1 is not selectable (it is selected)');
    assert.ok(g.isSelectable(0, 2), '0,2 is again selectable');
    assert.ok(g.isSelectable(1, 2), '1,2 is selectable');
    assert.ok(g.isSelectable(1, 1), '1,1 is selectable');
    assert.ok(g.isSelectable(1, 0), '1,0 is selectable');
  });
});
