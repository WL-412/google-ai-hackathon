import React from "react";
import Lottie from 'react-lottie-player';


const LoadingPage: React.FC = () => {

  const animationPath = chrome.runtime.getURL('./public/anime/小五.json');

  return (
    <div>
      <Lottie
        loop
        path={animationPath}
        play
        style={{
          width: '50%',
          height: '50%',
        }}
      />
      <p>Preparing your scavenger hunt...</p>
    </div>
  );
};

export default LoadingPage;
