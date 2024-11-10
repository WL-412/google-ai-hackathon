// FloatingSidebarContainer.tsx
import React, { useState } from 'react';
import FloatingFigure from './FloatingFigure';
import Sidebar from './Sidebar';
import Draggable from 'react-draggable';


const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleFigureClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Draggable>
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <FloatingFigure onClick={handleFigureClick} />
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </div>
    </Draggable>
  );
};

export default FloatingSidebarContainer;
