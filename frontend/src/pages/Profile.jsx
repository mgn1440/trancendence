import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileInfo from "./components/ProfileInfo";
import TopNavBar from "./components/TopNavBar";
import { axiosUserMe } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";
import { useState, useEffect } from "@/lib/dom";

const ProfilePage = () => {
  const [myProfile, setMyProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setMyProfile(userMe.data);
    };
    fetchProfile();
  }, []);

  return (
    <div>
      {isEmpty(myProfile) ? null : (
        <div>
          <div id="top">
            <TopNavBar />
          </div>
          <div id="middle">
            <div class="main-section flex-row">
              <ProfileImg stat={0} />
              <ProfileInfo data={myProfile} />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
