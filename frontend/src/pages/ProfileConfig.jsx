import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileConfig from "./components/ProfileConfig";
import TopNavBar from "./components/TopNavBar";
import { useState, useEffect, useRef } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";
import { clientUserStore, setUserData } from "@/store/clientUserStore";

const ProfileConfigPage = () => {
  const [profile, setProfile] = useState({});
  const [getProfileImg, setProfileImg] = useRef(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      if (!userMe.data) {
        return;
      }
      setUserData(clientUserStore.dispatch, userMe.data.user_info);
      console.log(userMe.data.user_info);
      setProfile(userMe.data.user_info);
    };
    fetchProfile();
  }, []);
  return (
    <div>
      {isEmpty(clientUserStore.getState().client) ? null : (
        <div>
          <div id="top">
            <TopNavBar />
          </div>
          <div id="middle">
            <div class="main-section flex-row">
              <ProfileImg
                stat={1}
                profile={clientUserStore.getState().client}
                setProfileImg={setProfileImg}
              />
              <ProfileConfig
                profile={clientUserStore.getState().client}
                getProfileImg={getProfileImg}
              />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileConfigPage;
