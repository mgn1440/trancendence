import { useState, useEffect } from "@/lib/dom";
import Modal from "./Modal";
import TitleSection from "./ModalSection";
import { InputBox, RadioCheck } from "./Inputs";
import { BottomSection } from "./ModalSection";

let roomHostName = "";

// export const changeRoomHostName = (newHostName) => (roomHostName = newHostName);

const LobbyRoom = ({ roomInfo, clickEvent }) => {
  return (
    <div class="lobby-room" onclick={() => clickEvent(roomInfo)}>
      <h6>{roomInfo.room_name}</h6>
      <p>
        {roomInfo.players.length}/{roomInfo.mode}
      </p>
    </div>
  );
};

const LobbyRooms = ({ roomList, sendLobbySocket }) => {
  console.log(roomList);
  useEffect(() => {
    const modalElement = document.getElementById("PswdRoomModal");
    const handleModalHidden = () => {
      console.log("Modal hidden");
      const inputs = modalElement.querySelectorAll("input[type=text]");
      inputs.forEach((input) => (input.value = ""));
    };

    modalElement.addEventListener("hidden.bs.modal", handleModalHidden);

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
    };
  }, []);

  const handleRoomClick = (roomInfo, sendLobbySocket) => {
    document.getElementById(
      "PswdRoomModal"
    ).childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].innerText =
      roomInfo.room_name;
    console.log(roomInfo);
    roomHostName = roomInfo.host;
    sendLobbySocket({
      type: "join_room",
      host: roomInfo.host,
    });
  };

  return (
    <div class="lobby-rooms-main">
      <Modal
        id="PswdRoomModal"
        title={() =>
          TitleSection({ IconPath: "/icon/enter.svg", Title: "basic room" })
        }
        body={() => {
          return <InputBox text="Password" />;
        }}
        footer={() =>
          BottomSection({
            ButtonName: "Enter",
            ClickEvent: () => {
              sendLobbySocket({
                type: "join_secret_room",
                host: roomHostName,
                password: document.querySelector("#PswdRoomModal input").value,
              });
            },
          })
        }
      />
      <div class="lobby-rooms-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="lobby-rooms">
        {roomList.map((room) => (
          <LobbyRoom
            roomInfo={room}
            clickEvent={() => handleRoomClick(room, sendLobbySocket)}
            sendLobbySocket={sendLobbySocket}
          />
        ))}
        {/* <LobbyRoom roomName={roo} clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 2" clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 3" clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 4" clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 5" clickEvent={handleRoomClick} /> */}
      </div>
    </div>
  );
};

export default LobbyRooms;
