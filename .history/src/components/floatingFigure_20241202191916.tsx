// FloatingFigure.tsx
import React from 'react';
import Lottie from 'react-lottie-player';



const FloatingFigure: React.FC = () => {


  const imageUrl = chrome.runtime.getURL("./public/Vector.png");


  const animationPath = chrome.runtime.getURL('./public/小五动画.json');

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
        path={animationPath} // Use the path directly
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
