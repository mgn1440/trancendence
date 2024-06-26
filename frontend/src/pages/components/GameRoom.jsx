import { useEffect, useState } from "@/lib/dom/index.js";

import UserCard from "@/pages/components/UserCard";
import UserList from "./UserList";
import { ItemInput, ItemToggle } from "./Items";
import { InputBox, NumberStepper, RadioCheck, ToggleBtn } from "./Inputs";
import { clientUserStore } from "@/store/clientUserStore";
import {
  eventType,
  addEventArray,
  addEventHandler,
  gotoPage,
} from "@/lib/libft";
import { draw } from "../utils/GameLogic";
// import { drawItems } from "../CustomTournament";

let canvas;
let context;

var img1 = new Image();
var img2 = new Image();
var img3 = new Image();
var img4 = new Image();
img1.src = "/icon/ball_speed_up.svg";
img2.src = "/icon/ball_speed_down.svg";
img3.src = "/icon/expand_arrow.svg";
img4.src = "/icon/reduct_arrow.svg";
var imgs = { speed_up: img1, speed_down: img2, bar_up: img3, bar_down: img4 };
export const drawItems = (items, p_context, ratio = 1) => {
  console.log(items);
  items.forEach((item) => {
    switch (item.type) {
      case "speed_up":
        p_context.fillStyle = "rgba(255, 0, 0, 0.75)";
        break;
      case "speed_down":
        p_context.fillStyle = "rgba(0, 0, 255, 0.75)";
        break;
      case "bar_up":
        p_context.fillStyle = "rgba(255, 0, 255, 0.75)";
        break;
      case "bar_down":
        p_context.fillStyle = "rgba(255, 165, 0, 0.75)";
        break;
      default:
        p_context.fillStyle = "white";
    }
    p_context.fillRect(
      item.x * ratio - 25 * ratio,
      item.y * ratio - 25 * ratio,
      50 * ratio,
      50 * ratio
    );
    p_context.drawImage(
      imgs[item.type],
      item.x * ratio - 25 * ratio,
      item.y * ratio - 25 * ratio,
      50 * ratio,
      50 * ratio
    );
  });
};

const drawTooltip = (ratio) => {
  canvas = document.getElementById("tool-tip");
  context = canvas.getContext("2d");
  drawItems(
    [
      { type: "speed_up", x: 50, y: 50 },
      { type: "speed_down", x: 50, y: 150 },
      { type: "bar_up", x: 250, y: 50 },
      { type: "bar_down", x: 250, y: 150 },
    ],
    context,
    ratio
  );
  context.fillStyle = "white";
  context.fillText("Speed Up", 100 * ratio, ratio * 50);
  context.fillText("Speed down", 100 * ratio, ratio * 150);
  context.fillText("bar Up", 300 * ratio, ratio * 50);
  context.fillText("bar down", 300 * ratio, ratio * 150);
};

const GameRoom = ({ gameData, isStart, isCustom, sendRoomSocket }) => {
  useEffect(() => {
    if (gameData.is_custom) {
      drawTooltip(0.7);
    }
    addEventArray(eventType.KEYDOWN, (e) => {
      if (e.key === "t") {
        document.getElementById("tool-tip").style.display = "block";
      }
    });
    addEventArray(eventType.KEYUP, (e) => {
      if (e.key === "t") {
        document.getElementById("tool-tip").style.display = "none";
      }
    });

    addEventHandler();
  }, [gameData.is_custom]);
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
      {gameData.is_custom ? <canvas id="tool-tip" /> : <div />}
      <div class="game-room-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="game-room">
        <h3>{gameData.room_name?.slice(0, 30)}</h3>
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
