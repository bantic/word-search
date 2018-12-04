var dict = {};

function load() {
  console.log('worker, loading dict');
  fetch('/dicts/enable1.txt')
    .then(resp => resp.text())
    .then(wordsString => {
      var wordList = wordsString.split('\n');
      wordList.forEach(word => (dict[word] = true));
      console.log('worked loaded ' + wordList.length + ' words!');
      postMessage(['load', 'Completed!']);
    });
}

function validate(word) {
  word = word.toLowerCase();
  let result = !!dict[word];
  console.log('validating word', word, ': ', result);
  postMessage(['validate', [word, result]]);
}

onmessage = function(e) {
  var data = e.data;
  var command = data[0];

  if (command === 'load') {
    load();
  } else if (command === 'validate') {
    validate(data[1]);
  } else {
    console.log('unknown message', command, e);
  }
};
