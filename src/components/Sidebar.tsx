// Sidebar.tsx
import React, { useState } from "react";
import Questionnaire from "./Questionnaire";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, summary }) => {
  const [feedback, setFeedback] = useState<string[]>([]);

  const handleAnswersSubmit = (answers: string[]) => {
    // Send the answers to the backend for evaluation
    chrome.runtime.sendMessage(
      { action: "evaluate_answers", questions: summary, answers },
      (response) => {
        if (response && response.feedback) {
          setFeedback(response.feedback);
        }
      }
    );
  };

  return (
    <div
      style={{
        width: "350px",
        height: "600px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "rgba(0, 0, 0, 0.5) 0px 0px 15px",
        zIndex: 1001,
        display: isOpen ? "block" : "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1002,
          cursor: "pointer",
        }}
      >
        Close
      </button>
      <div
        style={{
          padding: "10px",
          overflowY: "auto",
          height: "calc(100% - 40px)",
        }}
      >
        <h3>LET'S DO THIS</h3>
        <Questionnaire
          questions={summary.split("\n")}
          onSubmit={handleAnswersSubmit}
        />
        {feedback.length > 0 && (
          <div>
            <h3>Feedback</h3>
            {feedback.map((fb, index) => (
              <p key={index}>{fb}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
