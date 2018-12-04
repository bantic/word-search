/* eslint-disable no-console */
import Component from '@ember/component';
import WordSearch, { scoreFor } from '../lib/word-search';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { bind } from '@ember/runloop';

const SPECIAL_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter'
};

function dup(arrOfObjects) {
  return arrOfObjects.map(o => {
    return { ...o };
  });
}

function isAlpha(letter) {
  return /^[a-z]$/i.test(letter);
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

  didInsertElement() {
    this._super(...arguments);
    this._addKeyListeners();
  },

  willDestroyElement() {
    this._removeKeyListeners();
    this._super(...arguments);
  },

  // Sync properties from the game engine to this component
  _updateProperties() {
    this.set('squares', dup(this.wordSearch.squares.toArray()));
    this.set('currentPath', this.wordSearch.currentPath);
  },

  _addKeyListeners() {
    this._keyHandler = bind(this, e => this.handleLetter(e.key || e.keyCode));
    document.addEventListener('keydown', this._keyHandler);
  },

  handleLetter(letter) {
    if (letter === SPECIAL_KEYS.ESCAPE) {
      this.wordSearch.clear();
    } else if (letter === SPECIAL_KEYS.ENTER) {
      if (this.get('currentPath')) {
        this.send('submit');
      }
    } else if (isAlpha(letter)) {
      this.wordSearch.selectLetter(letter.toUpperCase());
    }
    this._updateProperties();
  },

  _removeKeyListeners() {
    document.removeEventListener('keydown', this._keyHandler);
    this._keyHandler = null;
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
