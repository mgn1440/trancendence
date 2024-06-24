import UserList from "./components/UserList";
import LobbyProfile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { axiosUserMe } from "@/api/axios.custom";
import { useState, useEffect, useRef } from "@/lib/dom";
import { isEmpty, gotoPage } from "@/lib/libft";
import { MainProfileState } from "./GameRoom";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";

const LobbyPage = () => {
  const [roomList, setRoomList] = useState([]);

  useEffect(() => {
    const socketAsync = async () => {
      await connectGameLogicWebSocket(ws_gamelogic.dispatch, "/ws/lobby/");
      console.log(ws_gamelogic.getState().socket); // debug
      ws_gamelogic.getState().socket.onmessage = (e) => {
        const data = JSON.parse(e.data);

        // console.log(data); // debug
        if (data.type === "room_list") {
          setRoomList(data.rooms);
        } else if (data.type === "join_approved") {
          const pswdRoomModalElement = document.getElementById("PswdRoomModal");
          if (pswdRoomModalElement.classList.contains("show")) {
            pswdRoomModalElement.style.display = "none";
            setTimeout(() => {
              const modalBackdrop = document.querySelector(".modal-backdrop");
              if (modalBackdrop) {
                modalBackdrop.remove();
              }
            }, 10);
          }
          gotoPage(`/lobby/${data.room_id}`);
        } else if (data.type === "join_denied") {
          const pswdRoomModalElement = document.getElementById("PswdRoomModal");
          pswdRoomModalElement
            .querySelector(".modal-content")
            .classList.add("active");
          pswdRoomModalElement
            .querySelector(".modal-content")
            .classList.add("shake");
          pswdRoomModalElement.querySelector(".modal-content").addEventListener(
            "animationend",
            function () {
              this.classList.remove("shake");
              this.classList.remove("active");
            },
            { once: true }
          );
          pswdRoomModalElement.querySelector(".denied").classList.add("show");
        } else if (data.type === "password_required") {
          let enterModal = new bootstrap.Modal(
            document.getElementById("PswdRoomModal")
          );
          enterModal.show();
        } else if (data.type === "matchmaking_waiting") {
        } else if (data.type === "goto_matchmaking_game") {
          const quickMatchModal = new bootstrap.Modal(
            document.getElementById("QuickMatchModal")
          );
          setTimeout(() => {
            if (quickMatchModal) {
              quickMatchModal.hide();
            }
            const modalBackdrop = document.querySelector(".modal-backdrop");
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }, 10);
          gotoPage(`/game/${data.room_id}`);
        } else if (data.type === "room_created") {
          gotoPage(`/lobby/${data.room_id}`);
        }
      };
    };
    socketAsync();
  }, []);

  const sendLobbySocket = (roomData) => {
    if (
      ws_gamelogic.getState().socket &&
      ws_gamelogic.getState().socket.readyState === WebSocket.OPEN
    ) {
      ws_gamelogic.getState().socket.send(JSON.stringify(roomData));
      console.log(roomData);
    } else {
      console.log("socket is not ready");
    }
  };

  return (
    <div>
      <div id="top">
        <TopNavBar />
      </div>
      <div id="middle">
        <div class="main-section flex-column">
          <LobbyProfile
            sendLobbySocket={sendLobbySocket}
            stat={MainProfileState.LOBBY}
          />
          <LobbyRooms roomList={roomList} sendLobbySocket={sendLobbySocket} />
        </div>
        <UserList />
      </div>
    </div>
  );
};

export default LobbyPage;
