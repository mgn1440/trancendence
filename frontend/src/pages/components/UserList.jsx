const User = () => {
  const imgSrc = `img/minji_${Math.ceil(Math.random() * 5)}.jpg`;
  return (
    <div class="hstack gap-2">
      <div class="avatar">
        <img class="avatar-img rounded-circle mb-3" src={imgSrc} />
        <span class="isloggedin">●</span>
      </div>
      <div class="user-info overflow">
        <h6 class="text-start">User0</h6>
        <p class="mb-3 small text-truncate">win: 0 lose: 0</p>
      </div>
    </div>
  );
};

const UserList = () => {
  const userNum = 5;
  return (
    <div>
      {[...Array(parseInt(userNum))].map((n) => (
        <User />
      ))}
    </div>
  );
};

export default UserList;
