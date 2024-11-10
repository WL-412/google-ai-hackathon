// FloatingSidebarContainer.tsx
import React, { useState } from 'react';
import FloatingFigure from './FloatingFigure';
import Sidebar from './Sidebar';
import Draggable from 'react-draggable';


const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleFigureClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleDrag = (e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <>
      <Draggable onDrag={handleDrag}>
        <div style={{ position: 'fixed', zIndex: 1000 }}>
          <FloatingFigure onClick={handleFigureClick} />
        </div>
      </Draggable>
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: position.y - 10, // Adjust to position above the figure
            left: position.x + 60, // Adjust to position beside the figure
            zIndex: 999
          }}
        >
          <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        </div>
      )}

    </>
  );
};

export default FloatingSidebarContainer;
