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
  useEffect(() => {
    const fetchProfile = async () => {
      let user = await axiosUserMe();
      const username = history.currentPath().split("/")[2];
      if (user.data.message.username === username)
        window.location.href = "/profile/me";
      if (username !== "me") user = await axiosUserOther(username);
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
              <ProfileImg stat={0} />
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
