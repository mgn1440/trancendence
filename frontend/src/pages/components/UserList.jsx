import { axiosUserOther } from "@/api/axios.custom";
import { useEffect, useState } from "@/lib/dom";
import { isEmpty } from "@/lib/libft";
import { ws_userlist, startWebSocketConnection } from "@/store/userListWS";
import { clinetUserStore } from "@/store/clientUserStore";

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

export const User = ({ userName }) => {
  const [userData, setUserData] = useState({});
  const randNum = Math.ceil(Math.random() * 5);
  const imgSrc = `/img/minji_${randNum}.jpg`;
  useEffect(() => {
    const fetchUser = async () => {
      const user_temp = await axiosUserOther(userName);
      setUserData(user_temp.data.user_info);
      console.log(user_temp.data);
    };
    fetchUser();
  }, [userName]);

  return (
    <div class="user-item" onclick={() => moveToProfile(userData.username)}>
      <div class="profile">
        <img src={imgSrc} />
        <span class="isloggedin active">●</span>
      </div>
      <div class="user-info">
        {isEmpty(userData) ? null : (
          <div>
            <h6>{userData.username}</h6>
            <p>
              win: {userData.win} lose: {userData.lose} rate:
              {userData.win + userData.lose === 0
                ? 0
                : (userData.win / (userData.win + userData.lose)) * 100}
              %
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const UserSleep = ({ userName }) => {
  const [userData, setUserData] = useState({});
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await axiosUserOther(userName);
      setUserData(userData.data.user_info);
    };
    fetchUser();
  }, [userName]);

  const randNum = Math.ceil(Math.random() * 5);
  const imgSrc = `/img/minji_${randNum}.jpg`;
  return (
    <div class="user-item" onclick={() => moveToProfile(userData.username)}>
      <div class="profile sleep">
        <img src={imgSrc} />
        <span class="isloggedin sleep">●</span>
      </div>
      <div class="user-info">
        {isEmpty(userData) ? null : (
          <div>
            <h6>{userData.username}</h6>
            <p>
              win: {userData.win} lose: {userData.lose} rate:
              {userData.win + userData.lose === 0
                ? 0
                : (userData.win / (userData.win + userData.lose)) * 100}
              %
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const UserList = () => {
  const [userListData, setUserListData] = useState({});
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
              return <User userName={user} />;
            })}
          {userListData.offline &&
            userListData.offline.map((user) => {
              return <UserSleep userName={user} />;
            })}
        </div>
        <div class="user-search-bar">
          <input class="user-search-input"></input>
          <img src="/icon/search.svg"></img>
        </div>
      </div>
      <div class="overlay" onclick={userListToggleBack}></div>
    </div>
  );
};

export default UserList;
