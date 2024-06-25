import { addEventArray, gotoPage } from "@/lib/libft.js";
import { ItemInput, ItemToggle } from "./Items.jsx";
import { useState, useEffect } from "@/lib/dom/index.js";
import { isEmpty } from "@/lib/libft.js";
import {
  axiosUserMe,
  axiosUserMeConfig,
  axiosDeleteProfileImg,
} from "@/api/axios.custom.js";
import { setUserData, clientUserStore } from "@/store/clientUserStore.js";

const ProfileConfig = ({ profile, getProfileImg }) => {
  useEffect(() => {
    const inputs = document.querySelectorAll("input[type=text]");
    inputs.forEach((input) => {
      input.addEventListener("keydown", (e) => {
        console.log(e.key);
        const isalpha = /^[a-zA-Z0-9]*$/i.test(e.key);
        const isnumpad = /^[0-9]*$/i.test(e.key);
        if (!isalpha && !isnumpad) {
          e.preventDefault();
        }
      });
    });
  }, []);
  const saveMyConfig = async () => {
    const config2Change = new FormData();
    if (document.querySelectorAll("input[type=text]")[0].value !== "") {
      config2Change.append(
        "username",
        document.querySelectorAll("input[type=text]")[0].value
      );
    }
    if (document.querySelectorAll("input[type=text]")[1].value !== "") {
      config2Change.append(
        "multi_nickname",
        document.querySelectorAll("input[type=text]")[1].value
      );
    }

    config2Change.append(
      "otp_enabled",
      document.querySelectorAll("input[type=checkbox]")[0].checked
    );
    if (getProfileImg() === undefined) {
      // profile image not changed
    } else if (getProfileImg() === null) {
      axiosDeleteProfileImg();
    } else {
      config2Change.append("profile_image", getProfileImg());
    }
    const res = await axiosUserMeConfig(config2Change);

    const userMe = await axiosUserMe();
    setUserData(clientUserStore.dispatch, userMe.data.user_info);
    gotoPage("/profile/me");
    // config2Change.forEach((value, key) => {
    //   console.log(`${key}, ${value}`);
    // });
    // console.log(getProfileImg());
  };
  return (
    <div class="profile-config-main">
      {!profile ? null : <h3>{profile.username}</h3>}
      <div class="profile-config-list">
        <ItemInput ItemName="Nickname" defaultValue={profile.username} />
        <ItemInput
          ItemName="Multi-nickname"
          defaultValue={profile.multi_nickname}
        />
        <ItemToggle ItemName="2FA" isOn={profile.otp_enabled} />
      </div>
      <div class="profile-config-submit">
        <button
          onclick={() => gotoPage("/profile/me")}
          class="config-btn bg-gray50"
        >
          <img src="/icon/close.svg"></img>
          cancel
        </button>
        <button onclick={saveMyConfig} class="config-btn bg-gray70">
          <img src="/icon/done.svg"></img>
          save change
        </button>
      </div>
    </div>
  );
};

export default ProfileConfig;
