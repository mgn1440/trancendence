import { gotoPage } from "@/lib/libft.js";
import { ItemInput, ItemToggle } from "./Items.jsx";
import { useState, useEffect } from "@/lib/dom/index.js";
import { axiosUserMe } from "@/api/axios.custom.js";
import { isEmpty } from "@/lib/libft.js";

const ProfileConfig = ({ profile }) => {
  console.log(profile);
  const name = "Hyungjuk";
  const multiName = "Hyungjuk_multi";
  const win = 6;
  const lose = 4;
  const rate = 60;
  const logSingleNum = 7;
  const logMultiNum = 8;
  return (
    <div class="profile-config-main">
      {!profile ? null : <h3>{profile.username}</h3>}
      <div class="profile-config-list">
        <ItemInput ItemName="Nickname" />
        <ItemInput ItemName="Multi-nickname" />
        <ItemToggle ItemName="2FA" isOn={true} />
        <ItemToggle ItemName="2FA" isOn={false} />
      </div>
      <div class="profile-config-submit">
        <button
          onclick={() => gotoPage("/profile/me")}
          class="config-btn bg-gray50"
        >
          <img src="/icon/close.svg"></img>
          cancel
        </button>
        <button class="config-btn bg-gray70">
          <img src="/icon/done.svg"></img>
          save change
        </button>
      </div>
    </div>
  );
};

export default ProfileConfig;
