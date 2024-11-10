import React, { useState } from 'react';
import FloatingFigure from './FloatingFigure';
import Sidebar from './Sidebar';
import Draggable from 'react-draggable';

const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleFigureClick = () => {
    if (!isDragging) {
      setIsSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (e: any, data: any) => {
    // Allow a slight tolerance for minimal movement to still be considered a click
    if (Math.abs(data.x - position.x) < 5 && Math.abs(data.y - position.y) < 5) {
      setIsDragging(false);
    } else {
      setIsDragging(false);
      setPosition({ x: data.x, y: data.y });
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Draggable onStart={handleDragStart} onStop={handleDragStop}>
        <div>
          <FloatingFigure onClick={handleFigureClick} />
        </div>
      </Draggable>
      {isSidebarOpen && (
        <div style={{ position: 'absolute', left: `${position.x - 250}px`, top: `${position.y - 400}px` }}>
          <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        </div>
      )}
    </div>
  );
};

export default FloatingSidebarContainer;
