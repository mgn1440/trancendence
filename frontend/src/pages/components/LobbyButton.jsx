import Modal from "./Modal";
import { TitleSection, BottomSection } from "./ModalSection";
import { InputBox, RadioCheck } from "./Inputs";
import { useEffect, useRef, useState } from "@/lib/dom";
import { moveToProfile } from "./UserList";
import { axiosUserOther } from "@/api/axios.custom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { addEventArray, addEventHandler, eventType } from "@/lib/libft";

export const UserFind = ({ userData }) => {
  const imgSrc = `/img/minji_${
    (userData.username[0].charCodeAt(0) % 5) + 1
  }.jpg`;
  if (userData.profile_image !== null) {
    imgSrc = userData.profile_image;
  }
  return (
    <div
      class="user-item"
      onclick={() => {
        const findModalElement = document.getElementById("FindUserModal");
        setTimeout(() => {
          const findModal = new bootstrap.Modal(findModalElement);
          if (findModal) {
            findModal.hide();
          }
          const modalBackdrop = document.querySelector(".modal-backdrop");
          if (modalBackdrop) {
            modalBackdrop.remove();
          }
        }, 10);
        moveToProfile(userData.username);
      }}
    >
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
                : (
                    (userData.win / (userData.win + userData.lose)) *
                    100
                  ).toFixed(2)}
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
    modalElement.querySelector(".modal-content").classList.add("active");
    modalElement.querySelector(".modal-content").classList.add("shake");
    modalElement.querySelector(".modal-content").addEventListener(
      "animationend",
      function () {
        this.classList.remove("shake");
        this.classList.remove("active");
      },
      { once: true }
    );
    modalElement.querySelector(".denied").classList.add("show");
    inputs[1].focus();
    return false;
  }
  let mode = 0;
  if (radios[2].checked) mode = 2;
  else mode = 4;
  const retRoomData = {
    type: "create_room",
    room_name:
      inputs[0].value === "" ? `${data.username}'s Room` : inputs[0].value,
    mode: mode,
    is_custom: radios[5].checked ? true : false,
    is_secret: radios[1].checked ? true : false,
    password: radios[1].checked ? inputs[1].value : "",
  };
  return retRoomData;
};

const LobbyButton = ({ data, sendLobbySocket }) => {
  const createRoomModalReset = () => {
    const modalElement = document.getElementById("CreateRoomModal");
    if (!modalElement) return;
    const inputs = modalElement.querySelectorAll("input[type=text]");
    inputs.forEach((input) => (input.value = ""));
    const radios = modalElement.querySelectorAll("input[type=radio]");
    modalElement.querySelector(".denied").classList.remove("show");
    radios[0].checked = true;
    radios[2].checked = true;
    radios[4].checked = true;
    inputs[1].setAttribute("disabled", true);
    inputs[0].focus();
  };
  useEffect(() => {
    createRoomModalReset();
    const modalElement = document.getElementById("CreateRoomModal");
    modalElement.addEventListener("hidden.bs.modal", createRoomModalReset);
    modalElement.querySelectorAll("input[type=text]").forEach((input) => {
      input.addEventListener("keydown", (e) => {
        const isalpha = /^[a-zA-Z0-9]*$/i.test(e.key);
        const isnumpad = /^[0-9]*$/i.test(e.key);
        if (!isalpha && !isnumpad) {
          e.preventDefault();
        }
      });
    });

    const loaderElement = document.getElementById("QuickMatchModal");
    const handleLoaderHidden = () => {
      sendLobbySocket({ type: "cancel_matchmaking" });
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
        const findName = findModalElement.querySelector(
          ".user-item .user-info h6"
        );
        if (findName !== null) {
          setTimeout(() => {
            const findModal = new bootstrap.Modal(findModalElement);
            if (findModal) {
              findModal.hide();
            }
            const modalBackdrop = document.querySelector(".modal-backdrop");
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }, 10);
          moveToProfile(findName.innerText);
        }
      } else if (!isalpha && !isnumpad) {
        e.preventDefault();
      }
    };
    findModalElement.addEventListener("hidden.bs.modal", handleFindModalHidden);
    findModalElement.addEventListener("shown.bs.modal", handleFindModalShown);
    findModalElement.addEventListener("input", HandleFindInput);
    const findModalInput = findModalElement.querySelector("input");
    findModalInput.addEventListener("keydown", handleFindInput);

    addEventArray(eventType.KEYDOWN, (e) => {
      let isModalOpen = false;
      document.querySelectorAll(".modal").forEach((modal) => {
        if (modal.classList.contains("show")) {
          isModalOpen = true;
        }
      });
      if (isModalOpen) return;

      const findModal = new bootstrap.Modal(findModalElement);
      const quickMatchModal = new bootstrap.Modal(loaderElement);
      const createModal = new bootstrap.Modal(modalElement);
      const logoutModal = new bootstrap.Modal(
        document.getElementById("LogoutModal")
      );
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
        if (
          !document.getElementById("LogoutModal").classList.contains("show")
        ) {
          logoutModal.show();
        }
      } else if (e.key === "h") {
        gotoPage("/user/me");
      }
    });
    addEventHandler();

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
                type="text"
                text="Group Name"
                defaultValue={`${data.username}'s Room`}
              />
              <div class="radio-check body-element">
                <RadioCheck text="Open Room" name="lock" id="open" />
                <RadioCheck text="Private" name="lock" id="private" />
              </div>
              <InputBox type="text" text="Password" defaultValue="" />
              <div class="denied cl-red">password required</div>
              <div class="radio-check body-element robby-game-btn">
                <RadioCheck text="1 vs 1" name="battle" id="1vs1" />
                <RadioCheck text="Tournament" name="battle" id="tornament" />
              </div>
              <div class="radio-check body-element robby-game-btn">
                <RadioCheck text="Classic" name="type" id="classic" />
                <RadioCheck text="Custom" name="type" id="custom" />
              </div>
            </div>
          );
        }}
        footer={() => (
          <button
            class="small-btn"
            onclick={() => {
              const roomData = getModalInput(data);
              if (!roomData) {
                return;
              }
              sendLobbySocket(roomData);
            }}
          >
            create
          </button>
        )}
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
              {findStatus == 0 ? (
                <div />
              ) : (
                <div class="find-result">
                  {findResult ? (
                    <UserFind userData={findResult} />
                  ) : (
                    <div class="not-found-msg cl-red">no user found</div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      />
      <div class="modal" id="QuickMatchModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="loader">
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyButton;
