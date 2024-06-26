import { gotoPage } from "@/lib/libft";
import { axiosUserFollow, axiosUserUnfollow } from "@/api/axios.custom";
import { render, useEffect, useState } from "@/lib/dom";
import { ws_userlist } from "@/store/userListWS";

const dataURItoBlob = (dataURI) => {
  const binary = atob(dataURI.split(",")[1]);
  const array = [];

  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
};

const cropImage = async (img, width, height) => {
  const cropSize = width > height ? height : width;

  const canvas = document.createElement("canvas");
  canvas.width = cropSize;
  canvas.height = cropSize;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, cropSize, cropSize, 0, 0, cropSize, cropSize);

  let file = dataURItoBlob(
    await new Promise((resolve) => {
      resolve(canvas.toDataURL("image/jpeg"));
    })
  );

  const baseSize = 512000;
  const compSize = 25600;

  if (file.size >= baseSize) {
    const ratio = Math.ceil(Math.sqrt(file.size / compSize, 2));
    canvas.width /= ratio;
    canvas.height /= ratio;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      img,
      0,
      0,
      cropSize,
      cropSize,
      0,
      0,
      canvas.width,
      canvas.height
    );

    file = dataURItoBlob(
      await new Promise((resolve) => {
        resolve(canvas.toDataURL("image/jpeg"));
      })
    );
  }

  const formData = new FormData();
  formData.append("file", file, "profile.jpg");
  return formData.get("file");
};

const ProfileImg = ({ stat, setStat, profile, setProfileImg }) => {
  const username = profile.username;
  console.log(profile.profile_image);
  const [profileImgSrc, setProfileImgSrc] = useState(profile.profile_image);
  const defaultImg = `/img/minji_${(username[0].charCodeAt(0) % 5) + 1}.jpg`;

  useEffect(() => {
    const realUpload = document.querySelector(".real-upload");
    if (!realUpload) return;
    realUpload.addEventListener("change", (e) => {
      let file = e.currentTarget.files[0];

      if (!file) {
        return;
      }
      if (!file.type.match("image/*")) {
        alert("Only Image file can be uploaded.");
        return;
      }
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const { width, height } = img;
        file = await cropImage(img, width, height);
        setProfileImg(file);
        setProfileImgSrc(URL.createObjectURL(file));
      };
    });
  }, []);

  const follow = async (username) => {
    await axiosUserFollow(username);
    ws_userlist.getState().socket.send(JSON.stringify({ type: "update" }));
    setStat(3);
  };

  const unfollow = async (username) => {
    await axiosUserUnfollow(username);
    ws_userlist.getState().socket.send(JSON.stringify({ type: "update" }));
    setStat(2);
  };

  const changeProfile = () => {
    const realUpload = document.querySelector(".real-upload");
    realUpload.click();
  };
  const deleteProfile = () => {
    setProfileImgSrc(null);
    setProfileImg(null);
  };

  return (
    <div class="profile-img">
      <img src={profileImgSrc ?? defaultImg}></img>
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
          <input
            type="file"
            class="real-upload"
            accept="image/*"
            required
            style="display: none"
          />
          <button class="profile-change-btn" onclick={changeProfile}>
            <img src="/icon/change.svg"></img>
            Change Profile Photo
          </button>
          <button class="profile-change-btn bg-red" onclick={deleteProfile}>
            <img src="/icon/close.svg"></img>
            Delete Profile Photo
          </button>
        </div>
      ) : stat === 2 ? (
        <div>
          <button class="follow-btn" onclick={() => follow(username)}>
            <img src="/icon/user.svg"></img>
            Follow
          </button>
        </div>
      ) : (
        <div>
          <button class="follow-btn" onclick={() => unfollow(username)}>
            <img src="/icon/close.svg"></img>
            Unfollow
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileImg;
