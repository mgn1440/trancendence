import { history } from "../lib/router";
import { createElement } from "../lib/createElement";

const TwoFAPage = () => {
  const params = history.getPageParams();
  return (
    createElement("div", null,
      createElement("a", { class:"mediumSize", href: "/match", "data-link": true }, "sumit"),
    ));
};

export default TwoFAPage;
