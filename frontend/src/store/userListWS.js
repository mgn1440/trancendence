import { createStore } from "../lib/observer/Store.js";
import { gotoPage } from "@/lib/libft";
import { axiosLogout } from "@/api/axios.custom.js";
import { ws_gamelogic } from "@/store/gameLogicWS.js";

const WS_CONNECT = "WS_CONNECT";

const initState = {
  socket: {},
  offline: [],
  online: [],
};

const webSocketConnect = (socket, offline, online) => ({
  type: WS_CONNECT,
  payload: [socket, offline, online],
});

const reducer_userlist = (state = initState, action = {}) => {
  switch (action.type) {
    case WS_CONNECT:
      return {
        ...state,
        socket: action.payload[0],
        offline: action.payload[1],
        online: action.payload[2],
      };
    default:
      return state;
  }
};

export const ws_userlist = createStore(reducer_userlist);

export const startWebSocketConnection = (dispatch, setUserList) => {
  if (ws_userlist.getState().socket instanceof WebSocket === false) {
    const socket = new WebSocket("wss://" + "localhost" + "/ws/online/");

    dispatch(webSocketConnect(socket, [], []));
  } else {
    console.log("Socket Already connected");
  }
  // socket.onmessage = (e) => {
  ws_userlist.getState().socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "status") {
      dispatch(
        webSocketConnect(
          ws_userlist.getState().socket,
          data.offline,
          data.online
        )
      );
      setUserList(data);
    } else if (data.type === "add_online") {
      dispatch(
        webSocketConnect(
          ws_userlist.getState().socket,
          ws_userlist
            .getState()
            .offline.filter((obj) => obj.username !== data.online[0].username),
          [
            ...ws_userlist.getState().online,
            !ws_userlist
              .getState()
              .online.some((obj) => obj.username === data.online[0].username)
              ? data.online[0]
              : null,
          ].filter((obj) => obj !== null)
        )
      );

      setUserList({
        online: ws_userlist.getState().online,
        offline: ws_userlist.getState().offline,
      });
    } else if (data.type === "add_offline") {
      dispatch(
        webSocketConnect(
          ws_userlist.getState().socket,
          [
            ...ws_userlist.getState().offline,
            !ws_userlist
              .getState()
              .offline.some((obj) => obj.username === data.offline[0].username)
              ? data.offline[0]
              : null,
          ].filter((obj) => obj !== null),
          ws_userlist
            .getState()
            .online.filter((obj) => obj.username !== data.offline[0].username)
        )
      );

      setUserList({
        online: ws_userlist.getState().online,
        offline: ws_userlist.getState().offline,
      });
    } else if (data.type === "duplicate_login") {
      console.log("duplicate_login");
      axiosLogout().then((res) => {
        if (res.status === 200) {
          ws_userlist.getState().socket.close();
          ws_gamelogic.getState().socket.close();
          gotoPage("/");
        }
      });
    }
  };
};
