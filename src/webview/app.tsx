import React, { useState } from "react";

// eslint-disable-next-line @typescript-eslint/naming-convention
const App: React.FC = () => {
  const [count, setCount] = useState(0);
  console.log("hello from react");

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};

export default App;
