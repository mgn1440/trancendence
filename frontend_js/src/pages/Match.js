import { createElement } from "../lib/createElement";
import UserList from "./components/UserList";
import Profile from "./components/Profile";
import MatchList from "./components/MatchList";

const MatchPage = () => {
  return (
    createElement("div", { class: "row" },
      createElement("div", { class: "col-md-8 col-lg-9" }, 
        createElement(Profile),
        createElement(MatchList),
      ),
      createElement(UserList),
    ));
};

export default MatchPage;
