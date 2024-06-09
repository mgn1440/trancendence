import { createStore } from "../lib/observer/Store.js";

export const WS_CONNECT = 'WS_CONNECT';
export const WS_DISCONNECT = 'WS_DISCONNECT';
export const WS_SEND = 'WS_SEND';

export const userListWS = createStore((state = initState, action = {}) => {
  switch (action.type) {
    case "SET_USER_LIST":
      return { ...state, userList: action.payload };
    case "SET_USER_LIST_WS":
      return { ...state, userListWS: action.payload };
    default:
      return state;
  }
});
