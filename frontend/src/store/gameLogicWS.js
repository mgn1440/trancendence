import { gotoPage } from "@/lib/libft.js";
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

export const disconnectGameLogicWebSocket = () => {
  if (ws_gamelogic.getState().socket instanceof WebSocket === true) {
    ws_gamelogic.getState().socket.close();
  }
};

export const connectGameLogicWebSocket = (dispatch, path) => {
  if (
    ws_gamelogic.getState().socket instanceof WebSocket === false ||
    ws_gamelogic.getState().socket.readyState === WebSocket.CLOSED ||
    ws_gamelogic.getState().socket.readyState === WebSocket.CLOSING
  ) {
    const socket = new WebSocket("wss://" + "localhost" + path);
    dispatch(webSocketConnect(socket));
    socket.onerror = (e) => {
      gotoPage("/");
    };
  } else {
    console.log("WebSocket is already connected");
  }
};
