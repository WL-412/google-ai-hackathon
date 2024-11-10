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
        width: '50px',
        height: '50px',
        backgroundColor: '#007bff',  // Placeholder color
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px',
        position: 'fixed',
        bottom: '100px',  // Adjust positioning as needed
        right: '20px',
        cursor: 'pointer',
        zIndex: 1000
      }}
    >
      ?
    </div>
  );
};

export default FloatingFigure;
