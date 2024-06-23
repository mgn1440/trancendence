import { useEffect, useState } from "@/lib/dom";

const TestPage = () => {
  const [stat, setStat] = useState(0);

  const onclickHandler = () => {
    if (stat < 4) {
      setStat(stat + 1);
    }
  };
  return (
    <div>
      <button onclick={onclickHandler}>click Me!</button>
      {[...Array(stat)].map((_, i) => (
        <div>
          <p>{i + 1}</p>
        </div>
      ))}
      {[...Array(4 - stat)].map((_, i) => (
        <h1>{i + 1}</h1>
      ))}
    </div>
  );
};

export default TestPage;
