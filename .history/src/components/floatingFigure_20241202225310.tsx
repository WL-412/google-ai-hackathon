// FloatingFigure.tsx
import React from 'react';
import Lottie from 'react-lottie-player';



const FloatingFigure: React.FC = () => {

  const animationPath = chrome.runtime.getURL('./public/anime/小一.json');

  return (
    <div
      style={{
        width: '80px',
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
        path={animationPath}
        play
      />
    </div>
  );
};

export default FloatingFigure;
