import { useEffect, useState } from "@/lib/dom";
import { LoseMessage } from "./components/ResultMessage";

const TestPage = () => {
  const [stat, setStat] = useState(0);

  const onclickHandler = () => {
    if (stat < 4) {
      setStat(stat + 1);
    }
  };
  return (
    <div>
      <LoseMessage />
    </div>
  );
};

export default TestPage;
