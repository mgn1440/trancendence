import { useState, useEffect } from "@/lib/dom/index.js";

const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

const toggleSettingModal = () => {
  setIsSettingModalOpen(!isSettingModalOpen);
};

const LobbyButtons = () => {
  return (
    <div style="width: 150px; margin-left: auto">
      <div style="justify-content: center; display: flex;" class="row">
        <SettingModal />
        <button
          style="display: block; margin: auto; margin-bottom: 10px"
          class="mdSizeBtn"
          data-bs-toggle="modal"
          data-bs-target="#SettingModal"
        >
          SETTING
        </button>
        <button style="display: block; margin: auto" class="mdSizeBtn">
          MAKE ROOM
        </button>
      </div>
    </div>
  );
};

const SettingModal = () => {
  return (
    <div
      class="modal fade"
      id="SettingModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="SettingModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="twoFAModalLabel">
              Setting
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body, row">
            <input type="checkbox" id="toggle" hidden />
            <label for="toggle" class="toggleSwitch">
              <span class="toggleButton"></span>
            </label>
          </div>
          <div class="modal-footer">
            <a class="mdSizeBtn" href="/match" data-link="true">
              Log out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LobbyButtons;
