import UserList from "./components/UserList";
import Profile from "./components/LobbyProfile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";

const LobbyPage = () => {
  return (
    <div>
      <div id="top">
        <TopNavBar />
      </div>
      <div id="middle">
        <div class="main-section flex-column">
          <Profile />
          <LobbyRooms />
        </div>
        <UserList />
      </div>
    </div>
  );
};

export default LobbyPage;
