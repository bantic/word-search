import { DICE_CHOICES } from './dice';
// Return flat array of letters
function generateLettersArray() {
  return DICE_CHOICES.slice()
    .sort(() => (Math.random() > 0.5 ? 1 : -1))
    .map(letters => {
      return letters[Math.floor(Math.random() * letters.length)];
    });
}

class Square {
  constructor({ letter, row, column, active, selected, selectable }) {
    this.letter = letter;
    this.active = !!active;
    this.selected = !!selected;
    this.selectable = !!selectable;
    this.row = row;
    this.column = column;
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
    let column = index - row;
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
  constructor() {
    this.stack = [];
  }

  push(item) {
    this.stack.push(item);
  }

  pop() {
    this.stack.pop();
  }

  get head() {
    return this.stack[this.stack.length - 1];
  }

  toString() {
    return this.stack.map(s => s.letter).join('');
  }
}

class Game {
  constructor(letters = []) {
    this.size = 5;
    this.letters = letters.length ? letters : generateLettersArray();
    this.stack = new Stack();
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

  get selectedSquares() {
    return this.squares.toArray().filter(s => s.selected);
  }

  get selectableSquares() {
    return this.squares.toArray().filter(s => s.selectable);
  }

  isSelectable(row, column) {
    return this.selectableSquares.includes(this.squares.at(row, column));
  }

  toggleSelect(row, column) {
    let square = this.squares.at(row, column);
    if (square.selected) {
      this._unselect(square);
    } else if (square.selectable) {
      this._select(square);
    } else {
      throw new Error(
        `Tried to toggle selection of unselected, unselectable square`
      );
    }
  }

  _unselect(square) {
    if (!square.selected) {
      throw new Error(`Square was not selected!`);
    }
    square.selected = false;
    if (this.stack.head === square) {
      this.stack.pop();
    }
    this._updateSelectable();
    // if square is active, make previously-active square active
  }

  _select(square) {
    if (square.selected) {
      throw new Error(`Square was already selected`);
    }
    square.selected = true;
    square.selectable = false;
    this.stack.push(square);
    this._updateSelectable();
  }

  _updateSelectable() {
    if (this.selectedSquares.length === 0) {
      // all squares selectable
      this.squares.toArray().forEach(s => (s.selectable = true));
    } else {
      let head = this.stack.head;
      let selectable = this.squares
        .contiguous(head)
        .toArray()
        .filter(s => !s.selected);
      this.squares.toArray().forEach(square => {
        square.selectable = selectable.includes(square);
      });
    }
  }
}

export default Game;
