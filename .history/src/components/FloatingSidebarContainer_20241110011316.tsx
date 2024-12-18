import React, { useState } from 'react';
import FloatingFigure from './FloatingFigure';
import Sidebar from './Sidebar';
import Draggable from 'react-draggable';

const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const handleFigureClick = () => {
    if (!dragging) {
      setIsSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleDrag = (e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
    setDragging(true);
  };

  const handleDragStart = () => {
    setDragging(false);
  };

  const handleDragStop = () => {
    if (!dragging) {
      setDragging(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Draggable onStart={handleDragStart} onDrag={handleDrag} onStop={handleDragStop}>
        <div onClick={handleFigureClick}>
          <FloatingFigure />
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
