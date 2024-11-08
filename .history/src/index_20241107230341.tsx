// index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import FloatingSidebarContainer from './components/FloatingSidebarContainer';

// Ensure content script added the root element
const rootElement = document.getElementById('floating-sidebar-root');

if (rootElement) {
  ReactDOM.render(
    <React.StrictMode>
      <FloatingSidebarContainer />
    </React.StrictMode>,
    rootElement
  );
}
