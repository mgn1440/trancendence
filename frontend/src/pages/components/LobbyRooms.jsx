import { useState, useEffect } from "@/lib/dom";
import Modal from "./Modal";
import TitleSection from "./ModalSection";
import { InputBox, RadioCheck } from "./Inputs";
import { BottomSection } from "./ModalSection";

let roomID = 0;

const LobbyRoom = ({ roomInfo, clickEvent }) => {
  return (
    <div
      class={`lobby-room ${
        roomInfo.status === "room" ? "" : "bg-gray50 outline-gray50"
      }`}
      onclick={() => clickEvent(roomInfo)}
    >
      <div class="first-row">
        <h6>{roomInfo.room_name}</h6>
        <div>
          {roomInfo.is_secret ? <img src="/icon/lock.svg" /> : <div />}
          {roomInfo.is_custom ? <img src="/icon/spanner.svg" /> : <div />}
        </div>
      </div>
      <p>
        {roomInfo.status === "game" || roomInfo.status === "playing"
          ? "Playing..."
          : `${roomInfo.players.length}/${roomInfo.mode}`}
      </p>
    </div>
  );
};

const LobbyRooms = ({ roomList, sendLobbySocket }) => {
  useEffect(() => {
    const pswdModalElement = document.getElementById("PswdRoomModal");
    const handlePswdModalHidden = () => {
      const input = pswdModalElement.querySelector("input");
      input.value = "";
      pswdModalElement.querySelector(".denied").classList.remove("show");
    };
    const handlePswdModalShown = () => {
      const input = pswdModalElement.querySelector("input");
      input.focus();
    };
    const handlePswdModalShow = () => {
      pswdModalElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          sendLobbySocket({
            type: "join_secret_room",
            room_id: roomID,
            password: document.querySelector("#PswdRoomModal input").value,
          });
        }
      });
    };
    pswdModalElement.addEventListener("hidden.bs.modal", handlePswdModalHidden);
    pswdModalElement.addEventListener("shown.bs.modal", handlePswdModalShown);
    pswdModalElement.addEventListener("show.bs.modal", handlePswdModalShow);

    return () => {
      pswdModalElement.removeEventListener(
        "hidden.bs.modal",
        handlePswdModalHidden
      );
      pswdModalElement.removeEventListener(
        "shown.bs.modal",
        handlePswdModalShown
      );
      pswdModalElement.removeEventListener(
        "show.bs.modal",
        handlePswdModalShow
      );
    };
  }, []);

  const handleRoomClick = (roomInfo, sendLobbySocket) => {
    document.getElementById(
      "PswdRoomModal"
    ).childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].innerText =
      roomInfo.room_name;
    roomID = roomInfo.room_id;
    sendLobbySocket({
      type: "join_room",
      room_id: roomInfo.room_id,
    });
  };

  return (
    <div class="lobby-rooms-main">
      <Modal
        id="PswdRoomModal"
        title={() =>
          TitleSection({ IconPath: "/icon/lock.svg", Title: "basic room" })
        }
        body={() => {
          return (
            <div>
              <InputBox text="Password" defaultValue="" />
              <div class="denied cl-red">password not correct</div>
            </div>
          );
        }}
        footer={() => (
          <button
            class="small-btn"
            onclick={() => {
              sendLobbySocket({
                type: "join_secret_room",
                room_id: roomID,
                password: document.querySelector("#PswdRoomModal input").value,
              });
            }}
          >
            Enter
          </button>
        )}
      />
      <div class="lobby-rooms-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="lobby-rooms">
        {roomList.map((room) => {
          if (room.mode === "matchmaking") return;
          return (
            <LobbyRoom
              roomInfo={room}
              clickEvent={() => handleRoomClick(room, sendLobbySocket)}
              sendLobbySocket={sendLobbySocket}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LobbyRooms;
