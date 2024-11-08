import React from 'react';
import ReactDOM from 'react-dom/client';
import Menu from './components/Menu';
import FloatingSidebarContainer from './components/FloatingSidebarContainer';

const root = document.createElement("div")
root.className = "container"
document.body.appendChild(root)
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <FloatingSidebarContainer />
  </React.StrictMode>
);