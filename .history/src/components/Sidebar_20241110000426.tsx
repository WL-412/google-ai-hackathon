// Sidebar.tsx
import React from 'react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div
      style={{
        display: isOpen ? 'block' : 'none',
        position: 'fixed',  // Keeps the sidebar floating
        bottom: '0px',         // Centers the sidebar vertically
        right: '50px',        // Centers the sidebar horizontally
        transform: 'translate(-50%, -50%)', // Offsets the sidebar to the center
        width: '300px',
        height: '400px',
        backgroundColor: '#ffffff',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <button onClick={onClose} style={{ float: 'right', margin: '10px' }}>Close</button>
      {/* Sidebar content */}
    </div>
  );
};

export default Sidebar;
