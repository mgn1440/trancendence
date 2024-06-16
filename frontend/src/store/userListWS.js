import { createStore } from "../lib/observer/Store.js";

const WS_CONNECT = "WS_CONNECT";

const initState = {
  socket: {},
  userList: {},
};

const webSocketConnect = (socket, userList) => ({
  type: WS_CONNECT,
  payload: [socket, userList],
});

const reducer_userlist = (state = initState, action = {}) => {
  switch (action.type) {
    case WS_CONNECT:
      return {
        ...state,
        socket: action.payload[0],
        userList: action.payload[1],
      };
    default:
      return state;
  }
};

export const ws_userlist = createStore(reducer_userlist);

export const startWebSocketConnection = (dispatch, setUserList) => {
  if (ws_userlist.getState().socket instanceof WebSocket === false) {
    const socket = new WebSocket("ws://" + "localhost:8000" + "/ws/online/");

    dispatch(webSocketConnect(socket, {}));
    socket.onopen = (e) => {
      console.log("Socket Connected");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      if (data.type === "status") {
        dispatch(webSocketConnect(socket, data));
        setUserList(data);
      }
    };
  } else {
    console.log("Socket Already connected");
  }
};
