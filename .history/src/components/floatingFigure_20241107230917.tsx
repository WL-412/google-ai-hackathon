// FloatingFigure.tsx
import React from 'react';

type FloatingFigureProps = {
  onClick: () => void;  // Prop to handle click events
};

const FloatingFigure: React.FC<FloatingFigureProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '20px', // Adjust positioning as needed
        right: '20px',
        cursor: 'pointer',
        zIndex: 1000
      }}
    >
      {/* Replace with your figure (e.g., an image or icon) */}
      adsjiojqiow
    </div>
  );
};

export default FloatingFigure;
