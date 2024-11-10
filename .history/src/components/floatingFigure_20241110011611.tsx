// FloatingFigure.tsx
import React from 'react';


const FloatingFigure: React.FC = () => {
  return (
    <div

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
        zIndex: 1000
      }}
    >
      ?
    </div>
  );
};

export default FloatingFigure;
