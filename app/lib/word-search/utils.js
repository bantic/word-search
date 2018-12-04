function flatten(array) {
  return array.reduce((memo, item) => {
    if (Array.isArray(item)) {
      return memo.concat(flatten(item));
    } else {
      memo.push(item);
      return memo;
    }
  }, []);
}

export { flatten };
