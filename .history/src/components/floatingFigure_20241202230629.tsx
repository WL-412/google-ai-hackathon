// FloatingFigure.tsx
import React from 'react';
import Lottie from 'react-lottie-player';



const FloatingFigure: React.FC = () => {

  const animationPath = chrome.runtime.getURL('./public/anime/小1.gif');

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
      <img
        src={animationPath}
        alt="Floating Animation"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Ensures the GIF scales proportionally
        }}
      />
    </div>
  );
};

export default FloatingFigure;
