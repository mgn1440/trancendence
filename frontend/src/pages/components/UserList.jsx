import { axiosUserOther } from "@/api/axios.custom";
import { useEffect, useState } from "@/lib/dom";
import { isEmpty } from "@/lib/libft";
import { ws_userlist, startWebSocketConnection } from "@/store/userListWS";
import { clinetUserStore } from "@/store/clientUserStore";
import { calcGameRate } from "../utils/utils";

export const moveToProfile = (userName) => {
  if (
    window.location.pathname === `/profile/${userName}` ||
    userName === undefined
  ) {
    return;
  }
  if (userName === clinetUserStore.getState().client.username) {
    window.location.href = `/profile/me`;
  } else {
    window.location.href = `/profile/${userName}`;
  }
};

export const User = ({ user, isactive }) => {
  const randNum = (user.username[0].charCodeAt(0) % 5) + 1;
  const imgSrc = `/img/minji_${randNum}.jpg`;
  return (
    <div
      class={`user-item ${isactive ? "active" : "sleep"}`}
      onclick={() => moveToProfile(user.username)}
    >
      <div class="profile">
        <img src={user.profile_image ? user.profile_image : imgSrc} />
        <span class={`isloggedin ${isactive ? "active" : "sleep"}`}>●</span>
      </div>
      <div class="user-info">
        <div>
          <h6>{user.username}</h6>
          <p>
            win: {user.win} lose: {user.lose}
          </p>
          <p>rate: {calcGameRate(user)}%</p>
        </div>
      </div>
    </div>
  );
};

const UserList = () => {
  const [userListData, setUserListData] = useState(
    ws_userlist.getState().userList
  );
  useEffect(() => {
    const socketAsync = async () => {
      startWebSocketConnection(ws_userlist.dispatch, setUserListData);
      // console.log(ws_userlist.getState()); //debug
    };
    socketAsync();
  }, []);

  const userListToggle = () => {
    document.querySelector("#user-list-toggle").classList.toggle("active");
    document.querySelector(".overlay").classList.toggle("active");
  };
  const userListToggleBack = () => {
    document.querySelector("#user-list-toggle").classList.toggle("active");
    document.querySelector(".overlay").classList.toggle("active");
  };
  return (
    <div>
      <button class="user-list-btn" onclick={userListToggle}>{`<`}</button>
      <div id="user-list-toggle">
        <div class="user-list">
          {userListData.online &&
            userListData.online.map((user) => {
              return <User user={user} isactive={true} />;
            })}
          {userListData.offline &&
            userListData.offline.map((user) => {
              return <User user={user} isactive={false} />;
            })}
        </div>
      </div>
      <div class="overlay" onclick={userListToggleBack}></div>
    </div>
  );
};

export default UserList;
