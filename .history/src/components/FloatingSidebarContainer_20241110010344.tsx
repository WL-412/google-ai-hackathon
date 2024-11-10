import React, { useState } from 'react';
import FloatingFigure from './FloatingFigure';
import Sidebar from './Sidebar';
import Draggable from 'react-draggable';

const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const handleStart = (e: any, data: any) => {
    setStartPosition({ x: data.x, y: data.y });
    setDragging(false); // Initialize as false every time a drag starts
  };

  const handleDrag = (e: any, data: any) => {
    const distance = Math.sqrt(Math.pow(data.x - startPosition.x, 2) + Math.pow(data.y - startPosition.y, 2));
    if (distance > 10) { // 10 pixels threshold for drag
      setDragging(true);
    }
    setPosition({ x: data.x, y: data.y });
  };

  const handleStop = (e: any) => {
    if (!dragging) {
      setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar only if not dragged
    }
    setDragging(false); // Reset dragging state after drag stops
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Draggable onStart={handleStart} onDrag={handleDrag} onStop={handleStop}>
        <div>
          <FloatingFigure />
        </div>
      </Draggable>
      <div style={{ position: 'absolute', left: `${position.x - 250}px`, top: `${position.y - 400}px` }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
};

export default FloatingSidebarContainer;
