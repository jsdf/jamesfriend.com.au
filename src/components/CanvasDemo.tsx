import React, { useEffect, useRef } from 'react';

// Dynamic import of the demo code
const CanvasDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dynamically import the demo code to avoid SSR issues
    import('../../client/demo').then(({ attachDemo }) => {
      attachDemo(canvas);
    }).catch(err => {
      console.warn('Could not load canvas demo:', err);
    });
  }, []);

  return <canvas ref={canvasRef} id="demo" height="800" />;
};

export default CanvasDemo;