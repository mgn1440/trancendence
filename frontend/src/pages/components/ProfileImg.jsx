import { gotoPage } from "@/lib/libft";
import { axiosUserFollow, axiosUserUnfollow } from "@/api/axios.custom";

const ProfileImg = ({ user_id, stat }) => {
  const follow = (user_id) => {
    axiosUserFollow(user_id);
  };

  const unfollow = (user_id) => {
    axiosUserUnfollow(user_id);
  };

  return (
    <div class="profile-img">
      <img src="/img/minji_1.jpg"></img>
      {stat === 0 ? (
        <div>
          <button
            onclick={() => gotoPage("/profile/me/config")}
            class="profile-img-btn"
          >
            <img src="/icon/change.svg"></img>
            Change Profile
          </button>
        </div>
      ) : stat === 1 ? (
        <div>
          <button class="profile-change-btn">
            <img src="/icon/change.svg"></img>
            Change Profile Photo
          </button>
          <button class="profile-change-btn bg-red">
            <img src="/icon/close.svg"></img>
            Delete Profile Photo
          </button>
        </div>
      ) : stat === 2 ? (
        <div>
          <button class="follow-btn" onclick={() => follow(user_id)}>
            <img src="/icon/user.svg"></img>
            Follow
          </button>
        </div>
      ) : (
        <div>
          <button class="follow-btn" onclick={() => unfollow(user_id)}>
            <img src="/icon/close.svg"></img>
            Unfollow
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileImg;
