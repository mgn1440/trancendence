import { useState } from "@/lib/dom/index.js";
import { UserCard } from "@/pages/components/UserCard.jsx";

const GameRoom = () => {
  return (
    <div class="game-room">
      <img>back-button</img>
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
