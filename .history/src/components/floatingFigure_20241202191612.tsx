// FloatingFigure.tsx
import React from 'react';
import Lottie from 'react-lottie-player';
import { useEffect, useState } from 'react';



const FloatingFigure: React.FC = () => {
  const [animationData, setAnimationData] = useState<any>(null);


  const imageUrl = chrome.runtime.getURL("./public/Vector.png");


  useEffect(() => {
    const animationPath = chrome.runtime.getURL('./public/小五动画.json');
    fetch(animationPath)
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error('Error loading Lottie animation:', error));
  }, []);

  if (!animationData) {
    return null; // Or a loader/placeholder while the animation is loading
  }
  return (
    <div
      style={{
        width: '80px', // Adjust as needed for the animation size
        height: '80px',
        borderRadius: '50%',
        display: 'inline-block',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 2147483647,
      }}
    >
      <Lottie
        loop
        animationData={animationData}
        play
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default FloatingFigure;
