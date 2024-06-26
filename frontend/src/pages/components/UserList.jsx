import { axiosUserOther } from "@/api/axios.custom";
import { useEffect, useState } from "@/lib/dom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { ws_userlist, startWebSocketConnection } from "@/store/userListWS";
import { clientUserStore } from "@/store/clientUserStore";
import { calcGameRate } from "../utils/utils";
import { history } from "@/lib/router";

export const moveToProfile = (userName) => {
  if (
    history.currentPath() === `/profile/${userName}` ||
    userName === undefined
  ) {
    return;
  }
  if (userName === clientUserStore.getState().client.username) {
    gotoPage(`/profile/me`);
  } else {
    gotoPage(`/profile/${userName}`);
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
  const [userListData, setUserListData] = useState({
    offline: ws_userlist.getState().offline,
    online: ws_userlist.getState().online,
  });
  useEffect(() => {
    const socketAsync = async () => {
      startWebSocketConnection(ws_userlist.dispatch, setUserListData);
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
