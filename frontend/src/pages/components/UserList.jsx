const User = () => {
  const randNum = Math.ceil(Math.random() * 5);
  const imgSrc = `img/minji_${randNum}.jpg`;
  return (
    <div class="user-item">
      <div class="profile">
        <img src={imgSrc} />
        <span class="isloggedin">●</span>
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
  const userNum = 20;
  return (
    <div class="user-list">
      {[...Array(parseInt(userNum))].map((n) => (
        <User />
      ))}
    </div>
  );
};

export default UserList;
