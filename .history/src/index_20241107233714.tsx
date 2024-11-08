// index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingSidebarContainer from './components/FloatingSidebarContainer';

// Ensure content script added the root element
const rootElement = document.getElementById('floating-sidebar-root');

if (rootElement) {
  const root = createRoot(rootElement); // Create a React root
  root.render(
    <React.StrictMode>
      <FloatingSidebarContainer />
    </React.StrictMode>
  );
}
