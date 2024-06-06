export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const gotoPage = (path) => {
  window.location.href = path;
};
