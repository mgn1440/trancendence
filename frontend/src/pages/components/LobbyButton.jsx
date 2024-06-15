import Modal from "./Modal";
import { TitleSection, BottomSection } from "./ModalSection";
import { InputBox, RadioCheck } from "./Inputs";
import { useEffect, useRef, useState } from "@/lib/dom";
import { moveToProfile } from "./UserList";
import { axiosUserOther } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";

export const UserFind = ({ userData }) => {
  const randNum = Math.ceil(Math.random() * 5);
  const imgSrc = `/img/minji_${randNum}.jpg`;
  return (
    <div class="user-item" onclick={() => moveToProfile(userData.username)}>
      <div class="profile">
        <img src={imgSrc} />
      </div>
      <div class="user-info">
        {isEmpty(userData) ? null : (
          <div>
            <h6>{userData.username}</h6>
            <p>
              win: {userData.win} lose: {userData.lose} rate:
              {userData.win + userData.lose === 0
                ? 0
                : (userData.win / (userData.win + userData.lose)) * 100}
              %
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

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
      radios[0].checked = true;
      radios[2].checked = true;
    };

    modalElement.addEventListener("hidden.bs.modal", handleModalHidden);

    document.addEventListener("DOMContentLoaded", () => {
      const radios = modalElement.querySelectorAll("input[type=radio]");
      const inputs = modalElement.querySelectorAll("input[type=text]");
      if (radios[0].checked == true) inputs[1].disable = true;
      else inputs[1].disable = false;
    });

    const loaderElement = document.getElementById("QuickMatchModal");
    const handleLoaderHidden = () => {
      sendLobbySocket({ type: "cancel_matchmaking" });
      // console.log("modal hidden"); // debug
    };

    loaderElement.addEventListener("hidden.bs.modal", handleLoaderHidden);
    const findModalElement = document.getElementById("FindUserModal");
    const handleFindModalHidden = () => {
      const input = findModalElement.querySelector("input");
      input.value = "";
      setFindResult("");
    };
    const handleFindModalShown = () => {
      const input = findModalElement.querySelector("input");
      input.focus();
    };
    const handleFindInput = async (e) => {
      const isalpha = /^[a-zA-Z0-9]*$/i.test(e.key);
      const isnumpad = /^[0-9]*$/i.test(e.key);
      if (e.key === "Enter") {
        const findName = findModalElement.querySelector(".user-item .user-info h6");
        if (findName !== null) {
          moveToProfile(findName.innerText); 
        }
      }
      else if (!isalpha && !isnumpad) {
        e.preventDefault();
      }
    }
    findModalElement.addEventListener("hidden.bs.modal", handleFindModalHidden);
    findModalElement.addEventListener("shown.bs.modal", handleFindModalShown);
    findModalElement.addEventListener("input", HandleFindInput);
    const findModalInput = findModalElement.querySelector("input");
    findModalInput.addEventListener("keydown", handleFindInput);

    document.addEventListener("keydown", (e) => {
      let isModalOpen = false;
      document.querySelectorAll(".modal").forEach((modal) => {
        if (modal.classList.contains("show")){
          isModalOpen = true;
        }
      });
      if (isModalOpen) return;

      const findModal = new bootstrap.Modal(findModalElement);
      const quickMatchModal = new bootstrap.Modal(loaderElement);
      const createModal = new bootstrap.Modal(modalElement);
      const logoutModal = new bootstrap.Modal(document.getElementById("LogoutModal"));
      if (e.key === "f") {
        if (!findModalElement.classList.contains("show")) {
          findModal.show();
        }
      } else if (e.key === "q") {
        if (!loaderElement.classList.contains("show")) {
          quickMatchModal.show();
        }
      } else if (e.key === "c") {
        if (!modalElement.classList.contains("show")) {
          createModal.show();
        }
      } else if (e.key === "l") {
        if (!document.getElementById("LogoutModal").classList.contains("show")) {
          logoutModal.show();
        }
      }
    });

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
      loaderElement.removeEventListener("hidden.bs.modal", handleLoaderHidden);
      findModalElement.removeEventListener(
        "hidden.bs.modal",
        handleFindModalHidden
      );
      findModalElement.removeEventListener(
        "shown.bs.modal",
        handleFindModalShown
      );
      findModalInput.removeEventListener("keydown", handleFindInput);
    };
  }, []);

  const findModalInput = useRef("");
  const [findResult, setFindResult] = useState("");
  const [findStatus, setFindStatus] = useState(0);
  const HandleFindInput = async (e) => {
    const findModalElement = document.getElementById("FindUserModal");
    findModalInput.current = findModalElement.querySelector("input");
    const findName = findModalInput.current.value;
    let ret = null;
    if (findName === undefined) {
      return;
    } else if (findName === "") {
      setFindStatus(0);
    } else {
      setFindStatus(1);
      ret = await axiosUserOther(findName);
      if (ret.status == 200) {
        setFindResult(ret.data.user_info);
      } else {
        setFindResult(null);
      }
    }
  };

  return (
    <div class="lobby-buttons">
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
            },
          })
        }
      />
      <Modal
        id="FindUserModal"
        title={() =>
          TitleSection({ IconPath: "/icon/Search.svg", Title: "Find User" })
        }
        body={() => {
          return (
            <div>
              <div class="user-search-bar">
                <input class="user-search-input"></input>
                <img src="/icon/search.svg"></img>
              </div>
              {findStatus == 0 ? null : (
                <div class="find-result">
                  {findResult ? (
                    <UserFind userData={findResult} />
                  ) : (
                    <div class="not-found-msg">no user found</div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      />
      <div
        class="modal fade"
        id="QuickMatchModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="loader">
              <span></span>
            </div>
          </div>
        </div>
      </div>
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
        data-bs-target="#FindUserModal"
      >
        <img src="/icon/search.svg"></img>
        Find user
      </button>
      <button
        class="lobby-game-btn"
        onclick={() => {
          sendLobbySocket({ type: "matchmaking" });
          const quickMatchModal = new bootstrap.Modal(
            document.getElementById("QuickMatchModal")
          );
          quickMatchModal.show();
        }}
      >
        <img src="/icon/quick.svg"></img>
        Quick Match
      </button>
    </div>
  );
};

export default LobbyButton;
