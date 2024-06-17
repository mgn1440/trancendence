import { createStore } from "../lib/observer/Store.js";

const SET_CLIENT = "SET_CLIENT";

const initState = {
  client: {},
};

const set_client = (client) => ({
  type: SET_CLIENT,
  payload: client,
});

const reducer_client = (state = initState, action = {}) => {
  switch (action.type) {
    case SET_CLIENT:
      return { ...state, client: action.payload };
    default:
      return state;
  }
};

export const clientUserStore = createStore(reducer_client);

export const setUserData = (dispatch, client) => {
  dispatch(set_client(client));
};
