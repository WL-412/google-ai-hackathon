import React from 'react';

const FloatingFigure: React.FC = () => {
  const gifPath = chrome.runtime.getURL('./public/anime/小1.gif'); // Path to your GIF file

  return (
    <div
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'inline-block',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 2147483647,
        overflow: 'hidden', // Ensures the GIF fits within the circular frame
      }}
    >
      <img
        src={gifPath}
        alt="Floating Animation"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Ensures the GIF scales proportionally
        }}
      />
    </div>
  );
};

export default FloatingFigure;
