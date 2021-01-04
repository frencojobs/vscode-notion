import React, { useState } from "react";
import { BlockMapType, NotionRenderer } from "react-notion";

declare global {
  interface Window {
    data: string;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <NotionRenderer blockMap={JSON.parse(window.data) as BlockMapType} />
    </>
  );
};

export default App;
