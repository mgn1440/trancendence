import { useState } from "@/lib/dom/index.js";

import UserCard from "@/pages/components/UserCard";
import UserList from "./UserList";

const GameRoom = ({ userList, isStart, sendRoomSocket }) => {
  const handleStartBtn = () => {
    sendRoomSocket({ type: "start_game" });
    console.log("Game Start Button Clicked!");
  };
  console.log(userList);
  return (
    <div class="game-rooms-main">
      <div class="game-rooms-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="game-room">
        <img src="/img/left_arrow.svg"></img>
        <div class="user-cards">
          {/* js 코드 생각해서 component 변경하기 */}
          {userList.map((user) => (
            <UserCard user_name={user} />
          ))}
          {[...Array(4 - userList.length)].map((i) => (
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
