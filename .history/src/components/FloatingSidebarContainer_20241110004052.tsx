// FloatingSidebarContainer.tsx
import React, { useState } from 'react';
import FloatingFigure from './FloatingFigure';
import Sidebar from './Sidebar';
import Draggable from 'react-draggable';


const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleFigureClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleDrag = (e: any, data: any) => {
    // Update the position as fixed offsets from the bottom and right
    setPosition({
      x: window.innerWidth - data.x - 50,
      y: window.innerHeight - data.y - 50,
    });
  };
  return (
    <>
      <Draggable onDrag={handleDrag}>
        <div style={{ position: 'fixed', bottom: 50, right: 50, zIndex: 1000 }}>
          <FloatingFigure onClick={handleFigureClick} />
        </div>
      </Draggable>
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: position.y + 60, // Adjusts sidebar position relative to figure
            right: position.x + 260, // Adjusts sidebar position relative to figure
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
