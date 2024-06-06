import UserList from "./components/UserList";
import Profile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { useEffect, useState } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";
import GameRoom from "./components/GameRoom";
import { history } from "@/lib/router";

const RoomPage = () => {
  const [myProfile, setMyProfile] = useState({});
  const [userList, setUserList] = useState([]);
  const [roomSocket, setRoomSocket] = useState({});
  const [startBtn, setStartBtn] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setMyProfile(userMe.data);
    };
    const socketAsync = async () => {
      const socket = new WebSocket(
        "ws://" +
          "localhost:8000" +
          "/ws/room/" +
          history.currentPath().split("/")[2] +
          "/"
      );

      socket.onopen = function (e) {
        console.log("Game Room Socket Connected");
      };

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data.type === "connect_user" || data.type === "disconnect_user") {
          setUserList(data.user_list);
        } else if (
          data.type === "room_destroyed" ||
          data.type === "room_full" ||
          data.type === "room_not_exist"
        ) {
          window.location.href = "/lobby";
        } else if (data.type === "room_ready") {
          if (data.you === data.host) {
            setStartBtn(true);
          }
        } else if (data.type === "goto_game") {
          // console.log(`/game/${data.host}/`);
          window.location.href = `/game/${data.host}`;
        }
      };

      while (socket.readyState !== WebSocket.OPEN) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setRoomSocket(socket);
    };
    fetchProfile();
    socketAsync();
  }, []);

  const sendRoomSocket = (roomData) => {
    if (roomSocket && roomSocket.readyState === WebSocket.OPEN) {
      console.log(roomData);
      roomSocket.send(JSON.stringify(roomData));
    }
  };
  return (
    <div>
      {isEmpty(myProfile) ? null : (
        <div>
          <div id="top">
            <TopNavBar />
          </div>
          <div id="middle">
            <div class="main-section flex-column">
              <Profile data={myProfile} />

              <GameRoom
                userList={userList}
                isStart={startBtn}
                sendRoomSocket={sendRoomSocket}
              />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
