import { createStore } from "../lib/observer/Store.js";

const WS_GAMELOGIC = "WS_GAMELOGIC";

const initState = {
  socket: {},
};

const webSocketConnect = (socket) => ({
  type: WS_GAMELOGIC,
  payload: socket,
});

const reducer_gamelogic = (state = initState, action = {}) => {
  switch (action.type) {
    case WS_GAMELOGIC:
      return {
        ...state,
        socket: action.payload,
      };
    default:
      return state;
  }
};

export const ws_gamelogic = createStore(reducer_gamelogic);

export const connectGameLogicWebSocket = async (dispatch, path) => {
  if (ws_gamelogic.getState().socket instanceof WebSocket === true) {
    ws_gamelogic.getState().socket.close();
  }
  const socket = new WebSocket("ws://" + "localhost:8000" + path);

  dispatch(webSocketConnect(socket));
};
