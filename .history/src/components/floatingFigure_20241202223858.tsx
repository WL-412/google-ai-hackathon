// FloatingFigure.tsx
import React from 'react';
import Lottie from 'react-lottie-player';



const FloatingFigure: React.FC = () => {

  const animationPath = chrome.runtime.getURL('./public/anime/小2动画.json');

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
        style={{
          width: '100%',
          height: '100%',
        }}
        onError={(error) => {
          console.error('Lottie animation failed to load:', error);
        }}
      />
    </div>
  );
};

export default FloatingFigure;
