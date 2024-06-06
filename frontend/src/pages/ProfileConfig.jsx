import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileConfig from "./components/ProfileConfig";
import TopNavBar from "./components/TopNavBar";
import { useState, useEffect } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";

const ProfileConfigPage = () => {
  const [profile, setProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setProfile(userMe.data.message);
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
              <ProfileImg stat={1} />
              <ProfileConfig profile={profile} />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileConfigPage;
