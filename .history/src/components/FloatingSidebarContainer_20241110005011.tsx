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
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Draggable onDrag={handleDrag}>
        <div>
          <FloatingFigure onClick={handleFigureClick} />
        </div>
      </Draggable>
      <div style={{ position: 'absolute', left: `${position.x - 200}px`, top: `${position.y - 200}px` }}>
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </div>
    </div>
  );
};

export default FloatingSidebarContainer;
