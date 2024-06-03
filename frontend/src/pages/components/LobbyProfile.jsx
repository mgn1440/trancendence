import LobbyButton from "./ LobbyButton";

const LobbyProfile = () => {
  const name = "Hyungjuk";
  const win = 6;
  const lose = 4;
  const rate = 60;
  return (
    <div class="lobby-profile">
      <img src="/img/minji_1.jpg"></img>
      <div class="profile-space-btw">
        <div>
          <h3>{name}</h3>
          <p>Win: {win}</p>
          <p>Lose: {lose}</p>
          <p>Rate: {rate}%</p>
        </div>
        <LobbyButton /> 
      </div>
    </div>
  );
};

export default LobbyProfile;
