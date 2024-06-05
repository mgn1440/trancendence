import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileInfo from "./components/ProfileInfo";
import TopNavBar from "./components/TopNavBar";
import { axiosUserMe, axiosUserOther } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";
import { useState, useEffect } from "@/lib/dom";

const ProfilePage = () => {
  const [myProfile, setMyProfile] = useState({});
  const [stat, setStat] = useState(0); // [0: me, 1: config, 2: follow, 3: unfollow]
  const [user_id, setUserID] = useState(0); // [0: me, 1: config, 2: follow, 3: unfollow]
  useEffect(() => {
    const fetchProfile = async () => {
      let user = null;
      let userName = window.location.pathname.split("/").pop();
      if (userName === "me") {
        user = await axiosUserMe();
      } else {
        user = await axiosUserOther(userName);
        console.log(user.data);
        let follow = user.data.is_following;
        setUserID(user.data.user_id);
        if (!follow)
          setStat(2);
        else
          setStat(3);
      }
      setMyProfile(user.data);
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
              <ProfileImg stat={stat} user_id={user_id} />
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
