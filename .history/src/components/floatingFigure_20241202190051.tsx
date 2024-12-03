// FloatingFigure.tsx
import React from 'react';
import Lottie from "lottie-react";


const FloatingFigure: React.FC = () => {


  const imageUrl = chrome.runtime.getURL("./public/Vector.png");
  const animationURL = chrome.runtime.getURL("./public/小五动画.json");

  return (
    <div style={{ width: 300, height: 300 }}>
      <Lottie animationData={animationURL} loop={true} />
    </div>
  );
};

export default FloatingFigure;
