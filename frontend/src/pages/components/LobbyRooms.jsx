const GameRoom = () => {
  return (
    <div class="game-room">
      <h6>Game Room</h6>
      <p>2/4</p>
    </div>
  );
};

const LobbyRooms = () => {
  return (
    <div class="game-rooms">
      <GameRoom />
      <GameRoom />
      <GameRoom />
      <GameRoom />
      <GameRoom />
    </div>
  );
};

export default LobbyRooms;
