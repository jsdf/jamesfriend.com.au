import React from 'react';

export default function Example(props) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
  }, []);
  return <div>Example2: {tick}</div>;
}
