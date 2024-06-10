import LobbyButton from "./LobbyButton";
import { isEmpty } from "@/lib/libft";
import { MainProfileState } from "../GameRoom";

const LobbyProfile = ({ data, sendLobbySocket, stat }) => {
  const myProfile = data.user_info;
  const matchNum = myProfile.win + myProfile.lose;
  return (
    <div class="lobby-profile">
      <img src="/img/minji_1.jpg"></img>
      <div class="profile-space-btw">
        <div>
          <h3>{myProfile.username}</h3>
          <p>Win: {myProfile.win}</p>
          <p>Lose: {myProfile.lose}</p>
          <p>Rate: {matchNum ? (myProfile.win / matchNum) * 100 : 0}%</p>
        </div>
        {stat === MainProfileState.LOBBY ? (
          <LobbyButton data={data} sendLobbySocket={sendLobbySocket} />
        ) : null}
      </div>
    </div>
  );
};

export default LobbyProfile;
