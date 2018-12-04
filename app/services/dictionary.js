import Service from '@ember/service';

export default Service.extend({
  validate(word) {
    return word.length > 0;
  }
});
