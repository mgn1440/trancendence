import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileInfo from "./components/ProfileInfo";
import TopNavBar from "./components/TopNavBar";
import {
  axiosUserMe,
  axiosUserOther,
  axiosGameRecords,
} from "@/api/axios.custom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { useState, useEffect } from "@/lib/dom";
import { history } from "@/lib/router";

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [stat, setStat] = useState(0); // [0: me, 1: config, 2: follow, 3: unfollow]
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      let user = null;
      let name = window.location.pathname.split("/").pop();
      setUserName(name);
      if (name === "me") {
        user = await axiosUserMe();
      } else {
        user = await axiosUserOther(name);
        if (!user.data) {
          return;
        } else if (user.data.message === "User not found") {
          gotoPage("/lobby");
          return;
        }
        console.log(user.data);
        let follow = user.data.user_info.is_following;
        if (!follow) setStat(2);
        else setStat(3);
      }
      if (!user.data) {
        return;
      }
      console.log(user.data.user_info);
      setProfile(user.data.user_info);
    };
    fetchProfile();
  }, []);

  return (
    <div>
      <div id="top">
        <TopNavBar />
      </div>
      <div id="middle">
        {isEmpty(profile) ? (
          <div class="main-section flex-row"></div>
        ) : (
          <div class="main-section flex-row">
            <ProfileImg stat={stat} setStat={setStat} profile={profile} />
            <ProfileInfo profile={profile} />
          </div>
        )}
        <UserList />
      </div>
    </div>
  );
};

export default ProfilePage;
