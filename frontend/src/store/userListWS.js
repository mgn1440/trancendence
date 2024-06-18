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
  } else {
    console.log("Socket Already connected");
  }
  // socket.onmessage = (e) => {
  ws_userlist.getState().socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log(data);
    if (data.type === "status") {
      dispatch(webSocketConnect(ws_userlist.getState().socket, data));
      setUserList(data);
    } else if (data.type === "add_online") {
      if (
        !ws_userlist
          .getState()
          .userList.online.some(
            (obj) => obj.username === data.online[0].username
          )
      ) {
        ws_userlist.getState().userList.online.push(data.online[0]);
      }
      ws_userlist.getState().userList.offline.find((user, index) => {
        console.log(user);
        if (user.username === data.online[0].username) {
          ws_userlist.getState().userList.offline.splice(index, 1);
        }
      });
      setUserList(ws_userlist.getState().userList);
    } else if (data.type === "add_offline") {
      if (
        !ws_userlist
          .getState()
          .userList.offline.some(
            (obj) => obj.username === data.offline[0].username
          )
      ) {
        ws_userlist.getState().userList.offline.push(data.offline[0]);
      }
      ws_userlist.getState().userList.online.find((user, index) => {
        console.log(user);
        if (user.username === data.offline[0].username) {
          ws_userlist.getState().userList.online.splice(index, 1);
        }
      });
      setUserList(ws_userlist.getState().userList);
    }
  };
};
