// FloatingFigure.tsx
import React from 'react';
import Lottie from 'react-lottie-player';



const FloatingFigure: React.FC = () => {

  const imagePath = chrome.runtime.getURL('./public/1.png');

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
        src={imagePath}
        alt="Floating Figure"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export default FloatingFigure;
