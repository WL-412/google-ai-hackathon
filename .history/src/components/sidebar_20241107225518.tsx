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
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-300px',  // Slide in/out effect
        width: '300px',
        height: '100%',
        backgroundColor: '#ffffff',
        transition: 'right 0.3s ease',
        boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 15px',
        zIndex: 999
      }}
    >
      <button onClick={onClose} style={{ float: 'right', margin: '10px' }}>Close</button>
      {/* Sidebar content */}
    </div>
  );
};

export default Sidebar;
