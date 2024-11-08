// FloatingFigure.tsx
import React from 'react';
import figureImage from '../teacher.png'; // Update with the correct path

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
      <figureImage />
    </div>
  );
};

export default FloatingFigure;
