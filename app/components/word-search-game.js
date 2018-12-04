import Component from '@ember/component';
import WordSearch, { scoreFor } from '../lib/word-search';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

function dup(arrOfObjects) {
  return arrOfObjects.map(o => {
    return { ...o };
  });
}

export default Component.extend({
  tagName: '',
  dictionary: inject(),

  score: 0,

  words: computed(function() {
    return [];
  }),

  init() {
    this._super(...arguments);
    this.wordSearch = new WordSearch();
    this._updateProperties();
    this.get('dictionary').load();
  },

  _updateProperties() {
    this.set('squares', dup(this.wordSearch.squares.toArray()));
    this.set('currentPath', this.wordSearch.stack.toString());
  },

  actions: {
    toggleSquare(row, column) {
      this.wordSearch.toggleSelect(row, column);
      this._updateProperties();
    },

    clear() {
      this.wordSearch.clear();
      this._updateProperties();
    },

    submit() {
      let word = this.get('currentPath');
      this.get('dictionary')
        .validate(word)
        .then(res => {
          if (res) {
            this.set('score', this.get('score') + scoreFor(word));
            this.set('words', [word, ...this.get('words')]);
          } else {
            console.log('word', word, 'is not valid');
          }
          this.wordSearch.clear();
          this._updateProperties();
        });
    }
  }
});
