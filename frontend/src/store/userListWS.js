import { createStore } from "../lib/observer/Store.js";

const WS_CONNECT = 'WS_CONNECT';

const initState = {
  socket: {}
}

const webSocketConnect = socket => ({
  type: WS_CONNECT,
  payload: socket,
});

const reducer_userlist = (state = initState, action = {}) => {
  switch (action.type) {
    case WS_CONNECT:
      return { ...state, socket: action.payload };
    default:
      return state;
  }
};

export const ws_userlist = createStore(reducer_userlist);


export const startWebSocketConnection = (dispatch, setUserList) => {

  const socket = new WebSocket("ws://" + "localhost:8000" + "/ws/online/");

  socket.onopen = (e) => {
    console.log("WebSocket Connected");
    dispatch(webSocketConnect(socket));
  };

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log(data);
    if (data.type === "status") {
        setUserList(data);
    }
  };
}