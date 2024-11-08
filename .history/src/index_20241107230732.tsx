// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import FloatingSidebarContainer from './components/FloatingSidebarContainer';

// Ensure content script added the root element
const rootElement = document.getElementById('floating-sidebar-root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <FloatingSidebarContainer />
    </React.StrictMode>
  );
}
