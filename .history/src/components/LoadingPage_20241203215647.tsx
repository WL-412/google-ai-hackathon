import React from "react";
import Lottie from "react-lottie-player";

const LoadingPage: React.FC = () => {
  const animationPath = chrome.runtime.getURL('./public/anime/小五.json');
  const fontUrl = chrome.runtime.getURL('public/Synonym_Complete/Fonts/TTF/Synonym-Variable.ttf');

  // Inline styles for the container and p element
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    top: '30%'
  };

  const lottieStyle: React.CSSProperties = {
    width: '50%',
    height: '50%',
  };

  const paragraphStyle: React.CSSProperties = {
    fontFamily: `'CustomFont', sans-serif`,
    fontSize: '18px',
    textAlign: 'center',
  };

  // Dynamically inject scoped font-face for this component
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'CustomFont';
        src: url('${fontUrl}') format('truetype');
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style); // Clean up the style on component unmount
    };
  }, [fontUrl]);

  return (
    <div style={containerStyle}>
      <Lottie loop path={animationPath} play style={lottieStyle} />
      <p style={paragraphStyle}>Preparing your scavenger hunt...</p>
    </div>
  );
};

export default LoadingPage;
