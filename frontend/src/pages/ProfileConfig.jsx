import UserList from "./components/UserList";
import ProfileImg from "./components/ProfileImg";
import ProfileConfig from "./components/ProfileConfig";
import TopNavBar from "./components/TopNavBar";

const ProfileConfigPage = () => {
  return (
    <div>
      <div id="top">
        <TopNavBar />
      </div>
      <div id="middle">
        <div class="main-section flex-row">
          <ProfileImg stat={1} />
          <ProfileConfig />
        </div>
        <UserList />
      </div>
    </div>
  );
};

export default ProfileConfigPage;
