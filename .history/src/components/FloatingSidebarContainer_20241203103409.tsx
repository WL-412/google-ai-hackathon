import React, { useState } from "react";
import FloatingFigure from "./FloatingFigure";
import Sidebar from "./Sidebar";
import Draggable from "react-draggable";

const FloatingSidebarContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [dragging, setDragging] = useState(false);

  const handleFigureClick = () => {
    if (!dragging) {
      setIsSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSidebarWidth(400);
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
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "100px",
        zIndex: 2147483647,
      }}
    >
      <Draggable
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
      >
        <div onClick={handleFigureClick}>
          <FloatingFigure />
        </div>
      </Draggable>
      {isSidebarOpen && (
        <div
          style={{
            position: "absolute",
            left: `${position.x - sidebarWidth}px`,
            top: `${position.y - 1000}px`,
          }}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={handleCloseSidebar}
            width={sidebarWidth}
            setWidth={setSidebarWidth}
          />
        </div>
      )}
    </div>
  );
};

export default FloatingSidebarContainer;
