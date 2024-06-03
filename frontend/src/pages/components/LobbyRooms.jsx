import { useState } from "@/lib/dom";
import Modal from "./Modal";
import TitleSection from "./ModalSection";

const LobbyRoom = ({roomName, clickEvent}) => {
  return (
    <div class="lobby-room"
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
  const [modalTitle, setModalTitle] = useState("basic room");
  
  const handleRoomClick = (roomName) => {
    console.log(roomName);
    setModalTitle(roomName);
  }
  return (
    <div class="lobby-rooms-main">
      <Modal 
        id="EnterRoomModal"
        title={() => TitleSection({ IconPath: "/icon/enter.svg", Title: modalTitle })}
      />
      <div class="lobby-rooms-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="lobby-rooms">
        <LobbyRoom roomName="Game Room 1" clickEvent={handleRoomClick}/>
        <LobbyRoom roomName="Game Room 2" clickEvent={handleRoomClick}/>
        <LobbyRoom roomName="Game Room 3" clickEvent={handleRoomClick}/>
        <LobbyRoom roomName="Game Room 4" clickEvent={handleRoomClick}/>
        <LobbyRoom roomName="Game Room 5" clickEvent={handleRoomClick}/>
      </div>
    </div>
  );
};

export default LobbyRooms;
