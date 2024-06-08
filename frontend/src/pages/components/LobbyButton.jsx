import Modal from "./Modal";
import { TitleSection, BottomSection } from "./ModalSection";
import { InputBox, RadioCheck } from "./Inputs";
import { useEffect } from "@/lib/dom";

const getModalInput = (data) => {
  const modalElement = document.getElementById("CreateRoomModal");
  const inputs = modalElement.querySelectorAll("input[type=text]");
  inputs[0];
  const radios = modalElement.querySelectorAll("input[type=radio]");

  if (radios[1].checked && inputs[1].value == "") {
    alert("Please enter the password");
    return false;
  }
  const retRoomData = {
    type: "create_room",
    room_name:
      inputs[0].value === ""
        ? `${data.user_info.username}'s Room`
        : inputs[0].value,
    mode: radios[2].checked ? 2 : 4,
    is_secret: radios[1].checked ? true : false,
    password: radios[1].checked ? inputs[1].value : "",
  };
  return retRoomData;
};

const LobbyButton = ({ data, sendLobbySocket }) => {
  useEffect(() => {
    const modalElement = document.getElementById("CreateRoomModal");
    const handleModalHidden = () => {
      const inputs = modalElement.querySelectorAll("input[type=text]");
      inputs.forEach((input) => (input.value = ""));

      const radios = modalElement.querySelectorAll("input[type=radio]");
      radios.forEach((radio) => (radio.checked = false));
    };

    modalElement.addEventListener("hidden.bs.modal", handleModalHidden);

    document.addEventListener("DOMContentLoaded", () => {
      const radios = modalElement.querySelectorAll("input[type=radio]");
      const inputs = modalElement.querySelectorAll("input[type=text]");
      if (radios[0].checked == true) inputs[1].disable = true;
      else inputs[1].disable = false;
    });

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
    };
  }, []);

  return (
    <div>
      <Modal
        id="CreateRoomModal"
        title={() =>
          TitleSection({ IconPath: "/icon/users.svg", Title: "Create Room" })
        }
        body={() => {
          return (
            <div>
              <InputBox
                text="Group Name"
                defaultValue={`${data.user_info.username}'s Room`}
              />
              <div class="radio-check body-element">
                <RadioCheck text="Open Room" name="lock" id="open" />
                <RadioCheck text="Private" name="lock" id="private" />
              </div>
              <InputBox text="Password" defaultValue="" />
              <div class="radio-check body-element robby-game-btn">
                <RadioCheck text="1 vs 1" name="battle" id="1vs1" />
                <RadioCheck text="Tournament" name="battle" id="tornament" />
              </div>
            </div>
          );
        }}
        footer={() =>
          BottomSection({
            ButtonName: "Create",
            ClickEvent: () => {
              const roomData = getModalInput(data);
              if (!roomData) return;
              sendLobbySocket(roomData);
              window.location.href = `/lobby/${data.user_info.username}`;
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
      <button
        class="lobby-game-btn"
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
