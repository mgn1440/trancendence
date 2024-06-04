import { useState, useEffect } from "@/lib/dom";
import Modal from "./Modal";
import TitleSection from "./ModalSection";
import { InputBox, RadioCheck } from "./Inputs";
import { BottomSection } from "./ModalSection";

const LobbyRoom = ({ roomName, clickEvent }) => {
  return (
    <div
      class="lobby-room"
      data-bs-toggle="modal"
      data-bs-target="#EnterRoomModal"
      onclick={() => clickEvent(roomName)}
    >
      <h6>{roomName}</h6>
      <p>2/4</p>
    </div>
  );
};

const LobbyRooms = () => {
  useEffect(() => {
    const modalElement = document.getElementById("EnterRoomModal");
    const handleModalHidden = () => {
      console.log("Modal hidden");
      const inputs = modalElement.querySelectorAll("input[type=text]");
      inputs.forEach(input => input.value = "");
    };

    modalElement.addEventListener("hidden.bs.modal", handleModalHidden);

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
    };
  }, []);

  const handleRoomClick = (roomName) => {
    document.getElementById(
      "EnterRoomModal"
    ).childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].innerText =
      roomName;
  };

  return (
    <div class="lobby-rooms-main">
      <Modal
        id="EnterRoomModal"
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
              console.log("Enter Room");
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
        <LobbyRoom roomName="Game Room 1" clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 2" clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 3" clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 4" clickEvent={handleRoomClick} />
        <LobbyRoom roomName="Game Room 5" clickEvent={handleRoomClick} />
      </div>
    </div>
  );
};

export default LobbyRooms;
