import React, { useState } from 'react';
import FloatingFigure from './FloatingFigure';
import Sidebar from './Sidebar';
import Draggable from 'react-draggable';

const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);  // State to track dragging

  const handleFigureClick = () => {
    // Only toggle sidebar if not dragging
    if (!isDragging) {
      setIsSidebarOpen(!isSidebarOpen);
    }
    setIsDragging(false);  // Reset dragging state after click
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleDrag = (e: any, data: any) => {
    setIsDragging(true);  // Set dragging to true on drag
    setPosition({ x: data.x, y: data.y });
  };

  const handleStop = () => {
    // Reset dragging state on stop, but don't toggle here to avoid click conflict
    setIsDragging(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Draggable onDrag={handleDrag} onStop={handleStop}>
        <div>
          <FloatingFigure onClick={handleFigureClick} />
        </div>
      </Draggable>
      <div style={{ position: 'absolute', left: `${position.x - 250}px`, top: `${position.y - 400}px` }}>
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </div>
    </div>
  );
};

export default FloatingSidebarContainer;
