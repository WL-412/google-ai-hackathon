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
