// FloatingFigure.tsx
import React from 'react';


const FloatingFigure: React.FC = () => {


  const imageUrl = chrome.runtime.getURL("./images/Vector.png");

  return (
    <div
      style={{
        width: '50px',
        height: '50px',
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        borderRadius: '50%',
        display: 'inline-block',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px',
        cursor: 'pointer',
        zIndex: 2147483647
      }}
    >
      ?
    </div>
  );
};

export default FloatingFigure;
