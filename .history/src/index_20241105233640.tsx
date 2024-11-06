import React from 'react';
import ReactDOM from 'react-dom/client';
import Menu from './App';
import "./App.css";

const root = document.createElement("div")
root.className = "container"
document.body.appendChild(root)
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <Menu />
  </React.StrictMode>
);