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
  test('squares have rows and columns', function(assert) {
    let g = new Game();
    assert.equal(g.squares.at(0, 0).row, 0);
    assert.equal(g.squares.at(1, 0).row, 1);
    assert.equal(g.squares.at(2, 0).row, 2);

    assert.equal(g.squares.at(1, 0).column, 0);
    assert.equal(g.squares.at(1, 1).column, 1);
    assert.equal(g.squares.at(1, 2).column, 2);
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

    assert.equal(g.currentPath, 'A');

    g.toggleSelect(0, 1);
    assert.equal(
      g.selectableSquares.length,
      4,
      'selectable squares are updated again'
    );
    assert.equal(g.currentPath, 'AB');

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
    assert.equal(g.currentPath, null);

    g.toggleSelect(0, 0);
    g.toggleSelect(0, 1);
    g.toggleSelect(0, 2);
    assert.equal(g.currentPath, 'ABC');
    g.toggleSelect(0, 2);
    assert.equal(g.currentPath, 'AB');
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
  test('calling toggleSelect on a square outside the selectable area clears the board', function(assert) {
    let g = new Game();
    g.toggleSelect(0, 0);

    assert.equal(g.selectedSquares.length, 1);

    g.toggleSelect(2, 2);

    assert.equal(g.selectedSquares.length, 0);

    g.toggleSelect(0, 0);
    g.toggleSelect(0, 1);
    assert.equal(g.selectedSquares.length, 2);
    g.toggleSelect(0, 0);
    assert.equal(g.selectedSquares.length, 0);
  });
  test('selectLetter', function(assert) {
    let g = new Game(LETTERS);
    assert.equal(g.selectedSquares.length, 0);

    g.selectLetter('A');
    assert.equal(g.selectedSquares.length, 1);
    assert.equal(
      g.selectableSquares.length,
      3,
      'the 3 squares around the A are selectable'
    );
  });
  test('selectLetter when multiple letters match', function(assert) {
    let letters = LETTERS.slice();
    letters[4] = 'A'; // swap "E" at 0,4 for an extra "A"

    let g = new Game(letters);
    assert.equal(g.selectedSquares.length, 0);
    g.selectLetter('A');

    assert.equal(g.paths.length, 2, '2 paths');
    assert.equal(g.selectedSquares.length, 2, '2 selected squares');
    assert.equal(g.activeSquares.length, 2, '2 active squares');
    assert.equal(
      g.selectableSquares.length,
      6,
      'the 3 squares around each A are selectable'
    );
  });
  test('selectLetter with multiple paths when letter excludes path', function(assert) {
    let letters = LETTERS.slice();
    letters[4] = 'A'; // swap "E" at 0,4 for an extra "A"

    let g = new Game(letters);
    assert.equal(g.selectedSquares.length, 0);
    g.selectLetter('A');

    g.selectLetter('B');
    assert.equal(g.paths.length, 1, 'path collapsed');
    assert.equal(g.currentPath, 'AB');
    assert.equal(g.activeSquares.length, 1, '1 active square');
    assert.equal(g.selectedSquares.length, 2, '2 selected squares');
  });
});
