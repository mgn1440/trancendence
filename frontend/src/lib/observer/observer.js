import { isEmpty } from "../libft";
let currentObserver = null;

export const observe = (fn) => {
  currentObserver = fn;
  fn();
  currentObserver = null;
};

export const observable = obj => {
  
  const observerMap = {};

  return new Proxy(obj, {
    get (target, name) {
      observerMap[name] = observerMap[name] || new Set();
      if (currentObserver) observerMap[name].add(currentObserver)
      return target[name];
    },
    set (target, name, value) {
      if (target[name] === value) return true;
      // if (!isEmpty(target[name]) || target[name].url === value.url) return true;
      target[name] = value;
      observerMap[name].forEach(fn => fn());
      return true;
    },
  });

}
