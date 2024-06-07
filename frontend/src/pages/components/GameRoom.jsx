import { useState } from "@/lib/dom/index.js";

import UserCard from "@/pages/components/UserCard";
import UserList from "./UserList";

const GameRoom = () => {
  return (
    <div class="game-room">
      <img src="/img/chevron-left.svg"></img>
      <div class="user-cards">
        {/* js 코드 생각해서 component 변경하기 */}
        <UserCard />
        <UserCard />
        <UserCard />
        <UserCard />
      </div>
      <button class="small-btn">Game Start!</button>
    </div>
  );
};

export default GameRoom;
