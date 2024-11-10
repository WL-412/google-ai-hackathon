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
        bottom: '120px', // Adjust to be above the floating figure
        right: '60px',   // Adjust to position slightly to the left of the floating figure
        width: '250px',  // Set a width for the floating sidebar
        height: '400px', // Define the height as needed
        backgroundColor: '#ffffff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 15px',
        zIndex: 1001,
        display: isOpen ? 'block' : 'none', // Only show when isOpen is true
        transition: 'opacity 0.3s ease',
        padding: '10px',
      }}
    >
      <button onClick={onClose} style={{ float: 'right', margin: '10px' }}>Close</button>
      {/* Sidebar content */}
    </div>
  );
};

export default Sidebar;
