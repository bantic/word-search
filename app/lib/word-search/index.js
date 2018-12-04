import { DICE_CHOICES } from './dice';
import { flatten } from './utils';

// Return flat array of letters
function generateLettersArray() {
  return DICE_CHOICES.slice()
    .sort(() => (Math.random() > 0.5 ? 1 : -1))
    .map(letters => {
      return letters[Math.floor(Math.random() * letters.length)];
    });
}

function scoreFor(word) {
  if (word.length <= 4) {
    return 1;
  } else {
    switch (word.length) {
      case 5:
        return 2;
      case 6:
        return 3;
      case 7:
        return 5;
      default:
        return 11;
    }
  }
}

class Square {
  constructor({ letter, row, column, active, selected, selectable }) {
    this.letter = letter;
    this.active = !!active; // not used?
    this.selected = !!selected;
    this.selectable = !!selectable;
    this.row = row;
    this.column = column;
  }

  contiguousTo(other) {
    let { row, column } = other;
    if (row === this.row && column === this.column) {
      return false;
    } else {
      return (
        Math.abs(row - this.row) <= 1 && Math.abs(column - this.column) <= 1
      );
    }
  }
}

class Grid {
  constructor(items, size) {
    this.items = items;
    this.size = size;
  }

  at(row, column) {
    if (row < 0 || row >= this.size || column < 0 || column >= this.size) {
      return null;
    }
    let index = row * this.size + column;
    return this.items[index];
  }

  fromIndex(index) {
    let row = Math.floor(index / this.size);
    let column = index - row * this.size;
    return { row, column };
  }

  toArray() {
    return this.items;
  }

  contiguous(item) {
    let { row, column } = this.fromIndex(this.items.indexOf(item));
    return [
      this.at(row - 1, column - 1),
      this.at(row - 1, column),
      this.at(row - 1, column + 1),
      this.at(row, column - 1),
      this.at(row, column + 1),
      this.at(row + 1, column - 1),
      this.at(row + 1, column),
      this.at(row + 1, column + 1)
    ].filter(Boolean);
  }
}

class Stack {
  constructor(items = []) {
    this.stack = items;
  }

  push(item) {
    this.stack.push(item);
  }

  pop() {
    this.stack.pop();
  }

  get length() {
    return this.stack.length;
  }

  get head() {
    return this.stack[this.stack.length - 1];
  }

  toString() {
    return this.stack.map(s => s.letter).join('');
  }

  toArray() {
    return this.stack;
  }
}

class Game {
  constructor(letters = []) {
    this.size = 5;
    this.letters = letters.length ? letters : generateLettersArray();
    this.paths = [];
    this.squares = new Grid(
      this.letters.map((letter, index) => {
        return new Square({
          letter,
          row: Math.floor(index / this.size),
          column: index - this.size * Math.floor(index / this.size),
          selectable: true
        });
      }),
      this.size
    );
  }

  get currentPath() {
    let words = this.paths.map(p => p.toString());
    // Allow for multiple paths selected that have the same word
    let uniqueWords = new Set(words).size;
    if (uniqueWords === 1) {
      return words[0];
    }
  }

  get activeSquares() {
    return this.squares.toArray().filter(s => s.active);
  }

  get selectedSquares() {
    return this.squares.toArray().filter(s => s.selected);
  }

  get selectableSquares() {
    return this.squares.toArray().filter(s => s.selectable);
  }

  toggleSelect(row, column) {
    let square = this.squares.at(row, column);
    if (this.isSelectable(row, column)) {
      this._select(square);
    } else if (square.active) {
      this._unselect(square);
    } else {
      this.clear();
    }
  }

  selectLetter(letter) {
    // find all selectable squares matching this letter
    let selectable = this.selectableSquares.filter(
      square => square.letter === letter
    );
    this._multiSelect(selectable);
  }

  clear() {
    this.paths = [];
    this.squares.toArray().forEach(s => {
      s.active = false;
      s.selected = false;
      s.selectable = true;
    });
  }

  isSelectable(row, column) {
    return this.selectableSquares.includes(this.squares.at(row, column));
  }

  // Add to selection
  _multiSelect(squares) {
    let pathsToAdd = [];
    squares.forEach(square => {
      if (square.selected) {
        throw new Error(`Square already selected`);
      }
      let pathsToSquare = this.paths.filter(path =>
        path.head.contiguousTo(square)
      );
      if (pathsToSquare.length) {
        pathsToSquare.forEach(path => path.push(square));
      } else {
        pathsToAdd.push(new Stack([square]));
      }
    });
    pathsToAdd.forEach(p => this.paths.push(p));
    // prune any paths that are no longer valid
    let maxPathLength = Math.max(...this.paths.map(p => p.length));
    this.paths = this.paths.filter(p => p.length === maxPathLength);
    this._updateSelectable();
  }

  _unselect(square) {
    if (!square.selected) {
      throw new Error(`Square was not selected!`);
    }
    square.selected = false;
    let heads = this.paths.filter(p => p.head === square);
    if (heads.length) {
      heads.forEach(path => path.pop());
      this.paths = this.paths.filter(p => p.length);
    } else {
      this.paths = [];
    }
    this._updateSelectable();
  }

  _select(square) {
    if (square.selected) {
      throw new Error(`Square was already selected`);
    }
    if (!this.paths.length) {
      this.paths = [new Stack([square])];
    } else {
      this.paths[0].push(square);
    }
    this._updateSelectable();
  }

  _updateSelectable() {
    if (this.paths.length === 0) {
      // all squares selectable
      this.squares.toArray().forEach(s => {
        s.selectable = true;
        s.selected = false;
      });
    } else {
      this.squares.toArray().forEach(s => {
        s.active = s.selected = s.selectable = false;
      });
      this.paths.forEach(p => {
        p.head.active = true;
        p.toArray().forEach(s => (s.selected = true));
      });
      let selectable = flatten(
        this.paths
          .map(path => path.head)
          .map(square => this.squares.contiguous(square).toArray())
      ).filter(square => !square.selected);
      this.squares.toArray().forEach(square => {
        square.selectable = selectable.includes(square);
      });
    }
  }
}

export { scoreFor };
export default Game;
