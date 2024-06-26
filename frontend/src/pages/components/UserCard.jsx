import { useEffect, useState } from "@/lib/dom";
import { windowSizeStore } from "@/store/windowSizeStore";
import { axiosUserOther } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";

const UserCard = ({ user_name }) => {
  const defaultImg = `/img/minji_${(user_name[0].charCodeAt(0) % 5) + 1}.jpg`;
  const [myProfile, setMyProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      if (user_name === "-") return;
      const userOther = await axiosUserOther(user_name);
      setMyProfile(userOther.data.user_info);
      console.log(userOther.data.user_info);
    };
    fetchProfile();
  }, []);
  return (
    <div class="user-card border-user-select">
      <img src={myProfile.profile_image ?? defaultImg}></img>
      {windowSizeStore.getState().winSize.width === "large" ? (
        <h3>{user_name}</h3>
      ) : windowSizeStore.getState().winSize.width === "medium" ? (
        <h4>{user_name}</h4>
      ) : (
        <h5>{user_name}</h5>
      )}
    </div>
  );
};

export default UserCard;
