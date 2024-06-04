import UserList from "./components/UserList";
import LobbyProfile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { axiosUserMe } from "@/api/axios.custom";
import { useState, useEffect } from "@/lib/dom";
import { isEmpty } from "@/lib/libft";

const LobbyPage = () => {
  const [myProfile, setMyProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      console.log(userMe.data.message.username);
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
