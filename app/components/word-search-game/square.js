import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['word-search-square'],
  classNameBindings: ['selectable', 'selected'],
  attributeBindings: ['style'],
  style: computed('square.{row,column}', function() {
    return htmlSafe(`
      grid-column: ${this.get('square.column') + 1} / span 1;
      grid-row: ${this.get('square.row') + 1} / span 1;
    `);
  }),
  selectable: reads('square.selectable'),
  selected: reads('square.selected'),
  click() {
    this.get('onClick')(this.get('square.row'), this.get('square.column'));
  }
});
