// FloatingFigure.tsx
import React from 'react';
import Lottie from "lottie-react";


const FloatingFigure: React.FC = () => {


  const imageUrl = chrome.runtime.getURL("./public/Vector.png");
  const animationURL = chrome.runtime.getURL("./public/小五动画.json");


  return (
    <>
      <div style={{ width: 300, height: 300 }}>
        <Lottie animationData={animationURL} loop={true} />
      </div>
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
      </div></>
  );
};

export default FloatingFigure;
