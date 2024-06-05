import LobbyButton from "./LobbyButton";
import { isEmpty } from "@/lib/libft";

const LobbyProfile = ({ data }) => {
  // console.log(data.message);
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
        <LobbyButton /> 
      </div>
    </div>
  );
};

export default LobbyProfile;
