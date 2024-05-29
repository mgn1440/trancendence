import UserList from "./components/UserList";
import Profile from "./components/Profile";
import LobbyRooms from "./components/LobbyRooms";
import TopNavBar from "./components/TopNavBar";

const MatchPage = () => {
  return (
    <div>
      <div id="top">
        <TopNavBar />
      </div>
      <div id="middle">
        <div class="main-section">
          <Profile />
          <LobbyRooms />
        </div>
        <UserList />
      </div>
    </div>
  );
};

export default MatchPage;
