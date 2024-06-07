import { gotoPage } from "@/lib/libft";
import { axiosUserFollow, axiosUserUnfollow } from "@/api/axios.custom";
import { render, useEffect, useState } from "@/lib/dom";

const ProfileImg = ({ user_id, stat }) => {
  const [status, setFollowStat] = useState(stat);
  const follow = async (user_id) => {
    await axiosUserFollow(user_id);
    setFollowStat(3);
  };

  const unfollow = async (user_id) => {
    await axiosUserUnfollow(user_id);
    setFollowStat(2);
  };

  return (
    <div class="profile-img">
      <img src="/img/minji_1.jpg"></img>
      {status === 0 ? (
        <div>
          <button
            onclick={() => gotoPage("/profile/me/config")}
            class="profile-img-btn"
          >
            <img src="/icon/change.svg"></img>
            Change Profile
          </button>
        </div>
      ) : status === 1 ? (
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
      ) : status === 2 ? (
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
