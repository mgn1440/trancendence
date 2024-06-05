import UserList from "./components/UserList";
import LobbyProfile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { axiosUserMe } from "@/api/axios.custom";
import { useState, useEffect } from "@/lib/dom";
import { isEmpty, gotoPage } from "@/lib/libft";

const LobbyPage = () => {
  const [myProfile, setMyProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      console.log(userMe.data.user_info.username);
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
            <button onclick={() => gotoPage("/profile/hyungjuk")}>test</button>
          </div>
          <div id="middle">
            <div class="main-section flex-column">
              <LobbyProfile data={myProfile} />
              <LobbyRooms />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;
