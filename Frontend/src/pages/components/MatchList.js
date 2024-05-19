import { createElement } from "../../lib/createElement";

const MatchList = () => {
  return (
    createElement("div", { id:"matchList", class:"mt-4" },
      createElement("div", { }),
      "MatchList",  
    )
  );
}

export default MatchList;