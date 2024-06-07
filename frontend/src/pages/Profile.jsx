import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileInfo from "./components/ProfileInfo";
import TopNavBar from "./components/TopNavBar";
import {
  axiosUserMe,
  axiosUserOther,
  axiosGameRecords,
} from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";
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
        console.log(user);
        let follow = user.data.user_info.is_following;
        if (!follow) setStat(2);
        else setStat(3);
      }
      setProfile(user.data);
    };
    fetchProfile();
  }, []);

  return (
    <div>
      {isEmpty(profile) ? null : (
        <div>
          <div id="top">
            <TopNavBar />
          </div>
          <div id="middle">
            <div class="main-section flex-row">
              <ProfileImg stat={stat} user_name={userName} />
              <ProfileInfo data={profile} />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
