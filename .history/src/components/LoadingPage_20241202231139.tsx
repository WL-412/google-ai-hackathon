import React from "react";
import Lottie from "react-lottie-player";

const LoadingPage: React.FC = () => {
  const animationPath = chrome.runtime.getURL('./public/anime/小1.gif');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const, // Explicitly typed
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <img
        src={chrome.runtime.getURL('./public/anime/小1.gif')}
        alt="Animated GIF"
        style={{ width: '100%', height: '100%' }}
      />
      <p style={{
        fontSize: '18px',
        textAlign: 'center',
      }}>
        Preparing your scavenger hunt...
      </p>
    </div>
  );
};

export default LoadingPage;
