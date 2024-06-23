import { history } from "./router";

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const gotoPage = (path) => {
  removeEventHandler();
  history.push(path);
  // window.location.href = path;
};

const eventArray = {
  CLICK: [],
  CHANGE: [],
  KEYDOWN: [],
  KEYUP: [],
  DOMLOADED: [],
  RESIZE: [],
};

const resetEventArray = () => {
  for (let key in eventArray) {
    eventArray[key] = [];
  }
};

export const eventType = {
  CLICK: "CLICK",
  CHANGE: "CHANGE",
  KEYDOWN: "KEYDOWN",
  KEYUP: "KEYUP",
  DOMLOADED: "DOMLOADED",
  RESIZE: "RESIZE",
};

export const addEventArray = (eventType, event) => {
  eventArray[eventType].push(event);
};

export const addEventHandler = () => {
  eventArray["CLICK"].forEach((event) => {
    document.addEventListener("click", event);
  });
  eventArray["CHANGE"].forEach((event) => {
    document.addEventListener("change", event);
  });
  eventArray["KEYDOWN"].forEach((event) => {
    document.addEventListener("keydown", event);
  });
  eventArray["KEYUP"].forEach((event) => {
    document.addEventListener("keyup", event);
  });
  eventArray["DOMLOADED"].forEach((event) => {
    document.addEventListener("DOMContentLoaded", event);
  });
  eventArray["RESIZE"].forEach((event) => {
    window.addEventListener("resize", event);
  });
};

const removeEventHandler = () => {
  eventArray["CLICK"].forEach((event) => {
    document.removeEventListener("click", event);
  });
  eventArray["CHANGE"].forEach((event) => {
    document.removeEventListener("change", event);
  });
  eventArray["KEYDOWN"].forEach((event) => {
    document.removeEventListener("keydown", event);
  });
  eventArray["KEYUP"].forEach((event) => {
    document.removeEventListener("keyup", event);
  });
  eventArray["DOMLOADED"].forEach((event) => {
    document.removeEventListener("DOMContentLoaded", event);
  });
  eventArray["RESIZE"].forEach((event) => {
    window.removeEventListener("resize", event);
  });
  resetEventArray();
};
