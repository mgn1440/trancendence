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
    <div class="lobby-rooms-main">
      <div class="lobby-rooms-nav">
        <button class="selected">
          <span class="vertical-text selected">Rooms</span>
        </button>
      </div>
      <div class="lobby-rooms">
        <LobbyRoom />
        <LobbyRoom />
        <LobbyRoom />
        <LobbyRoom />
        <LobbyRoom />
      </div>
    </div>
  );
};

export default LobbyRooms;
