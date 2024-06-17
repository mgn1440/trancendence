import LobbyButton from "./LobbyButton";
import { isEmpty } from "@/lib/libft";
import { MainProfileState } from "../GameRoom";
import { useState, useEffect } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { clientUserStore, setUserData } from "@/store/clientUserStore";
import { calcGameRate } from "../utils/utils";

const LobbyProfile = ({ data, sendLobbySocket, stat }) => {
  const [myProfile, setMyProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setUserData(clientUserStore.dispatch, userMe.data.user_info);
      // console.log(clientUserStore.getState()); // debug
      setMyProfile(userMe.data.user_info);
    };
    fetchProfile();
  }, []);
  console.log(myProfile); // debug

  return (
    <div class="lobby-profile">
      <img src={`/img/minji_${1}.jpg`}></img>
      <div class="profile-space-btw">
        {isEmpty(clientUserStore.getState().client) ? (
          <div></div>
        ) : (
          <div>
            <div>
              <h3>{clientUserStore.getState().client.username}</h3>
              <p>Win: {clientUserStore.getState().client.win}</p>
              <p>Lose: {clientUserStore.getState().client.lose}</p>
              <p>Rate: {calcGameRate(clientUserStore.getState().client)}%</p>
            </div>
            {stat === MainProfileState.LOBBY ? (
              <LobbyButton
                data={clientUserStore.getState().client}
                sendLobbySocket={sendLobbySocket}
              />
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
