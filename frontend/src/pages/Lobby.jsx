import UserList from "./components/UserList";
import LobbyProfile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { axiosUserMe } from "@/api/axios.custom";
import { useState, useEffect } from "@/lib/dom";
import { isEmpty, gotoPage } from "@/lib/libft";
import { MainProfileState } from "./GameRoom";

const LobbyPage = () => {
  const [myProfile, setMyProfile] = useState({});
  const [roomList, setRoomList] = useState([]);
  const [lobbySocket, setLobbySocket] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setMyProfile(userMe.data);
    };
    const socketAsync = async () => {
      const socket = new WebSocket("ws://" + "localhost:8000" + "/ws/lobby/");

      socket.onopen = (e) => {};

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "room_list") {
          setRoomList(data.rooms);
        } else if (data.type === "join_approved") {
          window.location.href = `/lobby/${data.host}`;
        } else if (data.type === "join_denied") {
          alert(data.message);
        } else if (data.type === "password_required") {
          let enterModal = new bootstrap.Modal(
            document.getElementById("PswdRoomModal")
          );
          enterModal.show();
        }
      };

      while (socket.readyState !== WebSocket.OPEN) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setLobbySocket(socket);
    };
    fetchProfile();
    socketAsync();
  }, []);

  const sendLobbySocket = (roomData) => {
    if (lobbySocket && lobbySocket.readyState === WebSocket.OPEN) {
      lobbySocket.send(JSON.stringify(roomData));
      console.log(roomData);
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
