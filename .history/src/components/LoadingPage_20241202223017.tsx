import React from "react";
import Lottie from 'react-lottie-player';


const LoadingPage: React.FC = () => {

  const animationPath = chrome.runtime.getURL('./public/anime/小2动画.json');

  return (
    <div>
      <p>Generating questions...</p>
      <Lottie
        loop
        path={animationPath}
        play
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default LoadingPage;
