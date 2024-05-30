const Profile = () => {
  const name = "Hyungjuk";
  const win = 6;
  const lose = 4;
  const rate = 60;
  return (
    <div class="lobby-profile">
      <img src="img/minji_1.jpg"></img>
      <div class="profile-space-btw">
        <div>
          <h3>{name}</h3>
          <p>Win: {win}</p>
          <p>Lose: {lose}</p>
          <p>Rate: {rate}%</p>
        </div>
        <div>
          <button class="lobby-game-btn">
            <img src="icon/user.svg"></img>
            Offline Game
          </button>
          <button class="lobby-game-btn">
            <img src="icon/users.svg"></img>
            Create Room
          </button>
          <button class="lobby-game-btn">
            <img src="icon/search.svg"></img>
            Quick Match
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
