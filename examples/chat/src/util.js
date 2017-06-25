export const noop = () => {};

export const omit = (key, dict) => {
  if (key in dict) {
    const copy = { ...dict };
    delete copy[key];
    return copy;
  }
  return dict;
}

const COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

export const getColorByString  = (str) => {
  let hash = 7;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + (hash << 5) - hash;
  }
  return COLORS[Math.abs(hash % COLORS.length)];
};

