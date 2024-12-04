import React from "react";
import "../styles/ConfirmationPopup.css";
import CloseIcon from "@mui/icons-material/Close";

interface ConfirmationPopupProps {
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  onClose,
  onConfirm,
}) => {

  {/* Create Font Style at Runtime */ }
  const fontUrl = chrome.runtime.getURL('public/Synonym_Complete/Fonts/TTF/Synonym-Variable.ttf');
  const style = document.createElement('style');
  style.textContent = `
      @font-face {
        font-family: 'CustomFont';
        src: url('${fontUrl}') format('truetype');
      }
    
      .popup-content h2 p {
        font-family: 'CustomFont', sans-serif;
      }

      .cancel-button {
        font-family: 'CustomFont', sans-serif;
      }

      .confirm-button {
        font-family: 'CustomFont', sans-serif;
      }

  }
    `;
  document.head.appendChild(style);

  return (
    <div className="confirmation-popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          <CloseIcon />
        </button>
        <h2>Are you sure you want to finish this hunt?</h2>
        <p>You can't come back and edit this hunt once you hit yes.</p>
        <div className="popup-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
