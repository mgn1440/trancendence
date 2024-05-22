import { history } from "../lib/router";
import { createElement } from "../lib/createElement";

const RoomPage = () => {
  const params = history.getPageParams();
  return (
    createElement("div", null,
      createElement("h2", null, `PostPage ${params}`),
      createElement("a", { href: "/", "data-link": true }, "go home"),
      createElement("span", null, "  "),
      createElement("a", { href: "/blog", "data-link": true }, "go blog")
    ));
};

export default RoomPage;
