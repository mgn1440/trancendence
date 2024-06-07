import UserList from "./components/UserList";
import Profile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";
import { useEffect, useState } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";
import GameRoom from "./components/GameRoom";

const RoomPage = () => {
  const [myProfile, setMyProfile] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      const userMe = await axiosUserMe();
      setMyProfile(userMe.data);
      console.log(userMe.data);
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
              <Profile data={myProfile} />
              <GameRoom />
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
