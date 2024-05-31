const ProfileImg = () => {
  return (
    <div class="profile-img">
      <img src="/img/minji_1.jpg"></img>
      <button class="profile-img-btn">
        <img src="/icon/change.svg"></img>
        Change Profile
      </button>
      <button class="profile-change-btn">
        <img src="/icon/change.svg"></img>
        Change Profile Photo
      </button>
      <button class="profile-change-btn bg-red">
        <img src="/icon/close.svg"></img>
        Delete Profile Photo
      </button>
      <button class="follow-btn">
        <img src="/icon/user.svg"></img>
        Follow
      </button>
      <button class="follow-btn">
        <img src="/icon/close.svg"></img>
        Unfollow
      </button>
    </div>
  );
};

export default ProfileImg;
