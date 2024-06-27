import { history } from "./router";
import lottie from "lottie-web";

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
  BEFOREUNLOAD: [],
  LOTTIE: [],
  LOTTIEANI: [],
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
  BEFOREUNLOAD: "BEFOREUNLOAD",
  LOTTIE: "LOTTIE",
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
  eventArray["BEFOREUNLOAD"].forEach((event) => {
    window.addEventListener("beforeunload", event);
  });
  eventArray["LOTTIE"].forEach((event) => {
    eventArray["LOTTIEANI"].push(lottie.loadAnimation(event));
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
  eventArray["BEFOREUNLOAD"].forEach((event) => {
    window.removeEventListener("beforeunload", event);
  });
  eventArray["LOTTIEANI"].forEach((event) => {
    event.destroy();
  });
  resetEventArray();
};
