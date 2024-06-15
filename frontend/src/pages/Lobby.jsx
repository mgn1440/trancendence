import UserList from "./components/UserList";
import LobbyProfile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { axiosUserMe } from "@/api/axios.custom";
import { useState, useEffect, useRef } from "@/lib/dom";
import { isEmpty, gotoPage } from "@/lib/libft";
import { MainProfileState } from "./GameRoom";

const LobbyPage = () => {
  const [myProfile, setMyProfile] = useState({});
  const [roomList, setRoomList] = useState([]);
  const [getLobbySocket, setLobbySocket] = useRef({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      console.log(userMe.data); // debug
      setMyProfile(userMe.data);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const socketAsync = async () => {
      const socket = new WebSocket("ws://" + "localhost:8000" + "/ws/lobby/");

      socket.onopen = (e) => {};

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);

        console.log(data); // debug
        if (data.type === "room_list") {
          setRoomList(data.rooms);
        } else if (data.type === "join_approved") {
          gotoPage(`/lobby/${data.room_id}`);
        } else if (data.type === "join_denied") {
          alert(data.message);
        } else if (data.type === "password_required") {
          let enterModal = new bootstrap.Modal(
            document.getElementById("PswdRoomModal")
          );
          enterModal.show();
        } else if (data.type === "matchmaking_waiting") {
          console.log("matchmaking_waiting"); //debug
        } else if (data.type === "goto_matchmaking_game") {
          gotoPage(`/game/${data.host}`);
        } else if (data.type === "room_created") {
          gotoPage(`/lobby/${data.room_id}`);
        }
      };

      while (socket.readyState !== WebSocket.OPEN) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setLobbySocket(socket);
    };
    socketAsync();
  }, []);

  const sendLobbySocket = (roomData) => {
    if (getLobbySocket() && getLobbySocket().readyState === WebSocket.OPEN) {
      getLobbySocket().send(JSON.stringify(roomData));
      console.log(roomData);
    } else {
      console.log("socket is not ready");
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
              <LobbyProfile
                data={myProfile}
                sendLobbySocket={sendLobbySocket}
                stat={MainProfileState.LOBBY}
              />
              <LobbyRooms
                roomList={roomList}
                sendLobbySocket={sendLobbySocket}
              />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;
