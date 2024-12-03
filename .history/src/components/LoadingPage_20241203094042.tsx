import React from "react";
import Lottie from "react-lottie-player";

const LoadingPage: React.FC = () => {
  const animationPath = chrome.runtime.getURL('./public/anime/小五.json');

  {/* Create Font Style at Runtime */ }
  const fontUrl = chrome.runtime.getURL('public/Synonym_Complete/Fonts/TTF/Synonym-Variable.ttf');
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'CustomFont';
      src: url('${fontUrl}') format('truetype');
    }
  
    .div p {
      font-family: 'CustomFont', sans-serif;
    }
  `;
  document.head.appendChild(style);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const, // Explicitly typed
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
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
        fontSize: '18px',
        textAlign: 'center',
      }}>
        Preparing your scavenger hunt...
      </p>
    </div>
  );
};

export default LoadingPage;
