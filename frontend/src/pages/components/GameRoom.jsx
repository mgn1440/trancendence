import { useState } from "@/lib/dom/index.js";

import UserCard from "@/pages/components/UserCard";
import UserList from "./UserList";
import { ItemInput, ItemToggle } from "./Items";
import { InputBox, NumberStepper, RadioCheck, ToggleBtn } from "./Inputs";
import { clientUserStore } from "@/store/clientUserStore";
import { gotoPage } from "@/lib/libft";

const GameRoom = ({ gameData, isStart, isCustom, sendRoomSocket }) => {
  const handleStartBtn = () => {
    let find_items = [];
    if (gameData.is_custom) {
      document.querySelectorAll(".toggle-button").forEach((btn) => {
        const isChecked = btn.querySelector("input").checked;
        const toggleText = btn
          .querySelector(".toggle-text")
          .textContent.replace(" ", "_");
        if (isChecked) find_items.push(toggleText);
      });
      sendRoomSocket({
        type: "start_game",
        goal_score: Number(document.querySelector("#Number").innerText),
        items: find_items,
      });
    } else {
      sendRoomSocket({ type: "start_game" });
    }
  };
  const roomSetting =
    gameData.is_custom &&
    gameData.user_list[0] === clientUserStore.getState().client.username ? (
      <div class="room-setting">
        <NumberStepper
          text="set score"
          type="input-goal"
          defaultValue={Number(3)}
        />
        <div class="item-buttons">
          <ToggleBtn text="speed up" />
          <ToggleBtn text="speed down" />
          <ToggleBtn text="bar up" />
          <ToggleBtn text="bar down" />
        </div>
      </div>
    ) : (
      <div />
    );

  return (
    <div class="game-room-main">
      <div class="game-room-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="game-room">
        <h3>{gameData.room_name}</h3>
        <h5>{gameData.is_custom ? "Custom" : "General"}</h5>
        {roomSetting}
        <div class="user-cards">
          {/* js 코드 생각해서 component 변경하기 */}
          {gameData.user_list &&
            gameData.user_list.map((data) => <UserCard user_name={data} />)}
          {gameData.user_list &&
            [...Array(gameData.mode - gameData.user_list.length)].map((i) => (
              <UserCard user_name="-" />
            ))}
        </div>
        <div class="align-end">
          <button
            class="small-btn bg-gray40"
            onclick={() => gotoPage("/lobby")}
          >
            Go to Lobby
          </button>
          {isStart ? (
            <button class="small-btn" onclick={handleStartBtn}>
              Game Start!
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
