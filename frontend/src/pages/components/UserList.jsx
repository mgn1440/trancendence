const User = () => {
  const randNum = Math.ceil(Math.random() * 5);
  const imgSrc = `/img/minji_${randNum}.jpg`;
  return (
    <div class="user-item">
      <div class="profile">
        <img src={imgSrc} />
        <span class="isloggedin active">●</span>
      </div>
      <div class="user-info">
        <h6>User{randNum}</h6>
        <p>
          win: {10 - randNum} lose: {randNum} rate:{" "}
          {((10 - randNum) / 10) * 100}%
        </p>
      </div>
    </div>
  );
};

const UserSleep = () => {
  const randNum = Math.ceil(Math.random() * 5);
  const imgSrc = `/img/minji_${randNum}.jpg`;
  return (
    <div class="user-item">
      <div class="profile sleep">
        <img src={imgSrc} />
        <span class="isloggedin sleep">●</span>
      </div>
      <div class="user-info">
        <h6>User{randNum}</h6>
        <p>
          win: {10 - randNum} lose: {randNum} rate:{" "}
          {((10 - randNum) / 10) * 100}%
        </p>
      </div>
    </div>
  );
};

const UserList = () => {
  const userNum = 5;
  const userSleepNum = 8;
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
          {[...Array(parseInt(userNum))].map((n) => (
            <User />
          ))}
          {[...Array(parseInt(userSleepNum))].map((n) => (
            <UserSleep />
          ))}
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
