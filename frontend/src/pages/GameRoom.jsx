import UserList from "./components/UserList";
import LobbyProfile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { useEffect, useState } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { isEmpty, gotoPage } from "@/lib/libft";
import GameRoom from "./components/GameRoom";
import { history } from "@/lib/router";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";
import { windowSizeStore, setWindowSize } from "@/store/windowSizeStore";
import { addEventArray, addEventHandler, eventType } from "@/lib/libft";

export const MainProfileState = {
  LOBBY: 1,
  ROOM: 2,
};

const RoomPage = () => {
  const [myProfile, setMyProfile] = useState({});
  const [gameData, setGameData] = useState([]);
  const [startBtn, setStartBtn] = useState(false);
  const [winSize, setWinSize] = useState(windowSizeStore.getState().winSize);
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setMyProfile(userMe.data);
    };
    const socketAsync = async () => {
      await connectGameLogicWebSocket(
        ws_gamelogic.dispatch,
        `/ws/room/${history.currentPath().split("/")[2]}/`
      );

      ws_gamelogic.getState().socket.onopen = function (e) {};

      ws_gamelogic.getState().socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "room_info" || data.type === "connect_user") {
          setGameData(data);
        } else if (data.type === "disconnect_user") {
          setGameData(data);
          if (data.mode !== data.user_list.length) {
            setStartBtn(false);
          }
        } else if (
          data.type === "room_destroyed" ||
          data.type === "room_full" ||
          data.type === "room_not_exist"
        ) {
          gotoPage("/lobby");
        } else if (data.type === "room_ready") {
          if (data.you === data.host) {
            setStartBtn(true);
          }
        } else if (data.type === "goto_game") {
          if (data.mode === 2) {
            if (data.is_custom) {
              gotoPage(`/custom/${data.room_id}`);
            } else {
              gotoPage(`/game/${data.room_id}`);
            }
          } else if (data.mode === 4)
            if (data.is_custom) {
              gotoPage(`/customTournament/${data.room_id}`);
            } else {
              gotoPage(`/tournament/${data.room_id}`);
            }
        }
      };
    };
    fetchProfile();
    socketAsync();
  }, []);

  useEffect(() => {
    setWindowSize(windowSizeStore.dispatch, setWinSize);
    addEventArray(eventType.RESIZE, () => {
      setWindowSize(windowSizeStore.dispatch, setWinSize);
    });
    addEventHandler();
  }, []);

  const sendRoomSocket = (roomData) => {
    if (
      ws_gamelogic.getState().socket &&
      ws_gamelogic.getState().socket.readyState === WebSocket.OPEN
    ) {
      ws_gamelogic.getState().socket.send(JSON.stringify(roomData));
    }
  };

  return (
    <div>
      <div id="top">
        <TopNavBar />
      </div>
      <div id="middle">
        <div class="main-section flex-column">
          <LobbyProfile stat={MainProfileState.ROOM} />
          <GameRoom
            gameData={gameData}
            isStart={startBtn}
            sendRoomSocket={sendRoomSocket}
          />
        </div>
        <UserList />
      </div>
    </div>
  );
};

export default RoomPage;
