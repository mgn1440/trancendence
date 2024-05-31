const LobbyRoom = () => {
  return (
    <div class="lobby-room">
      <h6>Game Room</h6>
      <p>2/4</p>
    </div>
  );
};

const LobbyRooms = () => {
  return (
    <div class="lobby-rooms">
      <LobbyRoom />
      <LobbyRoom />
      <LobbyRoom />
      <LobbyRoom />
      <LobbyRoom />
    </div>
  );
};

export default LobbyRooms;
