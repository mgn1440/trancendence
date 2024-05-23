const User = () => {
  const randNum = Math.ceil(Math.random() * 5);
  const imgSrc = `img/minji_${randNum}.jpg`;
  return (
    <div class="hstack gap-2">
      <div class="avatar">
        <img class="avatar-img rounded-circle mb-3" src={imgSrc} />
        <span class="isloggedin">●</span>
      </div>
      <div class="user-info overflow">
        <h6 class="text-start">User{randNum}</h6>
        <p class="mb-3 small text-truncate">
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
    <div class="overflow-scroll" style="height: 100vh;">
      {[...Array(parseInt(userNum))].map((n) => (
        <User />
      ))}
    </div>
  );
};

export default UserList;
