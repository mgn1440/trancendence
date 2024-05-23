import UserList from "./components/UserList";
import Profile from "./components/Profile";
import MatchList from "./components/MatchList";

const MatchPage = () => {
  return (
    <div class="window row">
      <div class="col-md-8 col-lg-9">
        <Profile />
        <MatchList />
      </div>
      <div class="col-md-4 col-lg-3">
        <UserList />
      </div>
    </div>
  );
};

export default MatchPage;
