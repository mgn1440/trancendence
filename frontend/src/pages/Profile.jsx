import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileInfo from "./components/ProfileInfo";
import TopNavBar from "./components/TopNavBar";

const ProfilePage = () => {
  return (
    <div>
      <div id="top">
        <TopNavBar />
      </div>
      <div id="middle">
        <div class="main-section flex-row">
          <ProfileImg />
          <ProfileInfo />
        </div>
        <UserList />
      </div>
    </div>
  );
};

export default ProfilePage;
