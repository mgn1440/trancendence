import Modal from "./Modal";
import { TitleSection, BottomSection } from "./ModalSection";

const LobbyButton = () => {
  return (
    <div>
      <Modal
        id="CreateRoomModal"
        title={() =>
          TitleSection({ IconPath: "/icon/users.svg", Title: "Create Room" })
        }
        body={() => <h6>Are you sure you want to create a room?</h6>}
        footer={() =>
          BottomSection({
            ButtonName: "Create",
            ClickEvent: () => {
              console.log("Create Room");
            },
          })
        }
      />
      <Modal
        id="QuickMatchModal"
        title={() =>
          TitleSection({ IconPath: "/icon/search.svg", Title: "Find User" })
        }
      />
      <button class="lobby-game-btn">
        <img src="/icon/user.svg"></img>
        Offline Game
      </button>
      <button
        class="lobby-game-btn"
        data-bs-toggle="modal"
        data-bs-target="#CreateRoomModal"
      >
        <img src="/icon/users.svg"></img>
        Create Room
      </button>
      <button class="lobby-game-btn"
        data-bs-toggle="modal"
        data-bs-target="#QuickMatchModal"
	  >
        <img src="/icon/search.svg"></img>
        Quick Match
      </button>
    </div>
  );
};

export default LobbyButton;
