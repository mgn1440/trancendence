import { history } from "./router";

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const gotoPage = (path) => {
  history.push(path);
  // window.location.href = path;
};
