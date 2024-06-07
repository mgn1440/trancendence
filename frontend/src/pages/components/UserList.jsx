import { axiosUserList, axiosUserOther } from "@/api/axios.custom";
import { useEffect, useState } from "@/lib/dom";
import { isEmpty } from "@/lib/libft";

const moveToProfile = (userName) => {
  if (window.location.pathname === `/profile/${userName}`) {  
    return ;
  }
  window.location.href = `/profile/${userName}`;
}

const User = ({ userName }) => {
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
  }, []);

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
              {(userData.win + userData.lose) === 0 ? 0 : (userData.win / (userData.win + userData.lose)) * 100}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const UserSleep = ({ userName }) => {
  const [userData, setUserData] = useState({});
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await axiosUserOther(userName);
      setUserData(userData.data.user_info);
    };
    fetchUser();
  }, []);

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
              {(userData.win + userData.lose) === 0 ? 0 : (userData.win / (userData.win + userData.lose)) * 100}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const UserList = () => {
  const [userListData, setUserListData] = useState({});
  // const [userListSocket, setUserListSocket] = useState({});
  useEffect(() => {
    const socketAsync = async () => {
      const socket = new WebSocket("ws://" + "localhost:8000" + "/ws/online/");

      socket.onopen = (e) => {
        console.log("WebSocket Connected");
      };
      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "status") {
          setUserListData(data);
          console.log(data);
        }
      };
      while (socket.readyState !== WebSocket.OPEN) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      // setUserListSocket(socket);
    };
    socketAsync();
  }, []);

  const userListToggle = () => {
    document.querySelector("#user-list-toggle").classList.toggle("active");
    document.querySelector(".overlay").classList.toggle("active");
  };
  const userListToggleBack = () => {
    console.log("overlay clicked");
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
            userListData.offline.map((user) => <UserSleep userName={user} />)}
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
