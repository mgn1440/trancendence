import { createStore } from "../lib/observer/Store.js";

const SET_WIN_SIZE = "SET_WIN_SIZE";

const initState = {
  winSize: "large",
};

const set_windowSize = (winSize) => ({
  type: SET_WIN_SIZE,
  payload: winSize,
});

const reducer_client = (state = initState, action = {}) => {
  switch (action.type) {
    case SET_WIN_SIZE:
      return { ...state, winSize: action.payload };
    default:
      return state;
  }
};

export const windowSizeStore = createStore(reducer_client);

export const setWindowSize = (dispatch, setWinSize) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const windowSize = {};
  if (windowWidth < 760) {
    windowSize.width = "small";
  } else if (windowWidth < 1280) {
    windowSize.width = "medium";
  } else {
    windowSize.width = "large";
  }
  if (windowHeight < 480) {
    windowSize.height = "small";
  } else if (windowHeight < 720) {
    windowSize.height = "medium";
  } else {
    windowSize.height = "large";
  }
  dispatch(set_windowSize(windowSize));
  console.log(windowSizeStore.getState().winSize);
  setWinSize(windowSizeStore.getState().winSize);
};
