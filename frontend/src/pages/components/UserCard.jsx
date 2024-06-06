const UserCard = ({ user_name }) => {
  return (
    <div class="user-card border-user-select">
      <img src="/img/minji_1.jpg"></img>
      <h3>{user_name}</h3>
    </div>
  );
};

export default UserCard;
