/* eslint-disable no-console */
import Service from '@ember/service';
import { run } from '@ember/runloop';
import { Promise } from 'rsvp';

export default Service.extend({
  init() {
    this._super(...arguments);
    console.log('loading worker!');
    this.worker = new Worker('worker.js');
    this.worker.onmessage = e => {
      run(() => this.onWorkerMessage(e));
    };
    this.pendingValidations = {};
  },

  load() {
    if (this.isLoaded) {
      return;
    } else {
      this.worker.postMessage(['load']);
    }
  },

  validate(word) {
    word = word.toLowerCase();
    return new Promise(resolve => {
      this.pendingValidations[word] = resolve;
      this.worker.postMessage(['validate', word]);
    });
  },

  onWorkerMessage(e) {
    console.log('worker message:', e);
    let [command, data] = e.data;
    if (command === 'validate') {
      let [word, result] = data;
      if (!this.pendingValidations[word]) {
        console.error(e);
        throw new Error(`Got result for non-pending word ${word}`);
      } else {
        this.pendingValidations[word](result);
        delete this.pendingValidations[word];
      }
    }
  },

  willDestroy() {
    this.worker.terminate();
    this.worker = null;
    this._super(...arguments);
  }
});
