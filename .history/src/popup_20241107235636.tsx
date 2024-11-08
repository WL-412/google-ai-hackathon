// popup.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './components/Popup';

const rootElement = document.getElementById('popup-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
