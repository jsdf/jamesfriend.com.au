import React from 'react';

export default function Demo(props) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
  }, []);
  return <div>Demo2: {tick}</div>;
}
