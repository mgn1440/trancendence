import { useState } from "@/lib/dom/index.js";

import UserCard from "@/pages/components/UserCard";
import UserList from "./UserList";

const GameRoom = ({ gameData, isStart, sendRoomSocket }) => {
  console.log(isStart);
  const handleStartBtn = () => {
    sendRoomSocket({ type: "start_game" });
    console.log("Game Start Button Clicked!");
  };
  console.log(gameData);
  return (
    <div class="game-room-main">
      <div class="game-room-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="game-room">
        {/* <img src="/img/left_arrow.svg"></img> */}
        <div class="user-cards">
          {/* js 코드 생각해서 component 변경하기 */}
          {gameData.user_list.map((data) => (
            <UserCard user_name={data} />
          ))}
          {[...Array(gameData.mode - gameData.user_list.length)].map((i) => (
            <UserCard user_name="-" />
          ))}
        </div>
        {isStart ? (
          <button class="small-btn" onclick={handleStartBtn}>
            Game Start!
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default GameRoom;
