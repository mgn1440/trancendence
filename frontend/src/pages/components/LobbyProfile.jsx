import LobbyButton from "./LobbyButton";
import { isEmpty } from "@/lib/libft";
import { MainProfileState } from "../GameRoom";
import { useState, useEffect } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { clinetUserStore, setUserData } from "@/store/clientUserStore";
import { calcGameRate } from "../utils/utils";

const LobbyProfile = ({ data, sendLobbySocket, stat }) => {
  const [myProfile, setMyProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setUserData(clinetUserStore.dispatch, userMe.data.user_info);
      // console.log(clinetUserStore.getState()); // debug
      setMyProfile(userMe.data);
    };
    fetchProfile();
  }, []);
  console.log(myProfile); // debug

  return (
    <div class="lobby-profile">
      <img src="/img/minji_1.jpg"></img>
      <div class="profile-space-btw">
        {isEmpty(myProfile) ? (
          <div></div>
        ) : (
          <div>
            <div>
              <h3>{myProfile.user_info.username}</h3>
              <p>Win: {myProfile.user_info.win}</p>
              <p>Lose: {myProfile.user_info.lose}</p>
              <p>Rate: {calcGameRate(myProfile.user_info)}%</p>
            </div>
            {stat === MainProfileState.LOBBY ? (
              <LobbyButton data={myProfile} sendLobbySocket={sendLobbySocket} />
            ) : (
              <div></div>
            )}
          </div>
        )}
        {stat === MainProfileState.LOBBY ? (
          <div class="lobby-buttons">
            <button class="lobby-game-btn">
              <img src="/icon/user.svg"></img>
              Offline Game
            </button>
            <button
              class="lobby-game-btn"
              data-bs-toggle="modal"
              data-bs-target="#CreateRoomModal"
            >
              <img src="/icon/users.svg"></img>
              Create Room
            </button>
            <button
              class="lobby-game-btn"
              data-bs-toggle="modal"
              data-bs-target="#FindUserModal"
            >
              <img src="/icon/search.svg"></img>
              Find user
            </button>
            <button
              class="lobby-game-btn"
              onclick={() => {
                const quickMatchModal = new bootstrap.Modal(
                  document.getElementById("QuickMatchModal")
                );
                quickMatchModal.show();
                sendLobbySocket({ type: "matchmaking" });
              }}
            >
              <img src="/icon/quick.svg"></img>
              Quick Match
            </button>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default LobbyProfile;
