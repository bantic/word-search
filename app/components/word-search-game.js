import Component from '@ember/component';
import WordSearch from '../lib/word-search';

function dup(arrOfObjects) {
  return arrOfObjects.map(o => {
    return { ...o };
  });
}

export default Component.extend({
  init() {
    this._super(...arguments);
    this.wordSearch = new WordSearch();
    this._updateProperties();
  },

  _updateProperties() {
    this.set('squares', dup(this.wordSearch.squares.toArray()));
    this.set('currentPath', this.wordSearch.stack.toString());
  },

  actions: {
    toggleSquare(row, column) {
      debugger;
      this.wordSearch.toggleSelect(row, column);
      this._updateProperties();
    }
  }
});
