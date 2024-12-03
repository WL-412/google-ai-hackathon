import React from "react";
import Lottie from "react-lottie-player";

const LoadingPage: React.FC = () => {
  const animationPath = chrome.runtime.getURL('./public/anime/小五.json');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const, // Explicitly typed
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#EBF495',
    }}>
      <Lottie
        loop
        path={animationPath}
        play
        style={{
          width: '50%',
          height: '50%',
        }}
      />
      <p style={{
        color: '#6e7926',
        fontSize: '18px',
        textAlign: 'center',
        marginTop: '20px',
      }}>
        Preparing your scavenger hunt...
      </p>
    </div>
  );
};

export default LoadingPage;
