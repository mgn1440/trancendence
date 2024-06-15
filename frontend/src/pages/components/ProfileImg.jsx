import { gotoPage } from "@/lib/libft";
import { axiosUserFollow, axiosUserUnfollow } from "@/api/axios.custom";
import { render, useEffect, useState } from "@/lib/dom";
import { ws_userlist } from "@/store/userListWS";

const ProfileImg = ({ user_name, stat, setStat }) => {
  console.log(stat);
  const follow = async (user_name) => {
    await axiosUserFollow(user_name);
    ws_userlist.getState().socket.send(JSON.stringify({ type: "update" }));
    setStat(3);
  };

  const unfollow = async (user_name) => {
    await axiosUserUnfollow(user_name);
    ws_userlist.getState().socket.send(JSON.stringify({ type: "update" }));
    setStat(2);
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
        (console.log("two"),
        (
          <div>
            <button class="follow-btn" onclick={() => follow(user_name)}>
              <img src="/icon/user.svg"></img>
              Follow
            </button>
          </div>
        ))
      ) : (
        (console.log(stat),
        (
          <div>
            <button class="follow-btn" onclick={() => unfollow(user_name)}>
              <img src="/icon/close.svg"></img>
              Unfollow
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ProfileImg;
