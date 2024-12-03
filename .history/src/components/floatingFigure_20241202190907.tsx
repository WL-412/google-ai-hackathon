// FloatingFigure.tsx
import React from 'react';
import Lottie from "react-lottie";

const FloatingFigure: React.FC = () => {


  const imageUrl = chrome.runtime.getURL("./public/Vector.png");
  const animationURL = chrome.runtime.getURL("./public/小五动画.json");

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationURL,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <>
      <div style={{ width: 300, height: 300 }}>
        <Lottie options={defaultOptions} height={300} width={300} />
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
