export const noop = () => {};

export const omit = (key, dict) => {
  if (key in dic) {
    const copy = { ...dict };
    delete copy[key];
    return copy;
  }
  return dict;
}

