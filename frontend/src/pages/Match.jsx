import UserList from "./components/UserList";
import Profile from "./components/Profile";
import MatchList from "./components/MatchList";

const MatchPage = () => {
  return (
    <div style="display: flex; flex-direction: row; ">
      <div style="width:100%">
        <Profile />
        <MatchList />
      </div>
      <div>
        <UserList />
      </div>
    </div>
  );
};

export default MatchPage;
