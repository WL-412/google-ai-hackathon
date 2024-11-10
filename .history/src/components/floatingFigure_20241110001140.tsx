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
        display: 'inline-block',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px',
        cursor: 'pointer',
      }}
    >
      ?
    </div>
  );
};

export default FloatingFigure;
