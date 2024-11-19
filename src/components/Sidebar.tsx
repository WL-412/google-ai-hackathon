// Sidebar.tsx
import React, { useState, useEffect } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, summary }) => {
  const [feedback, setFeedback] = useState<string[]>([]);
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState<
    { question: string; answer: string }[]
  >([]);

  useEffect(() => {
    // Retrieve questionAnswerPairs from chrome storage
    chrome.storage.local.get("questionAnswerPairs", (result) => {
      if (result.questionAnswerPairs) {
        setQuestionAnswerPairs(result.questionAnswerPairs);
      }
    });
  }, []);

  const handleGenerateQuestions = () => {
    setQuestionAnswerPairs([]);

    chrome.runtime.sendMessage({ action: "get_active_tab" }, (response) => {
      if (response && response.tabId) {
        chrome.runtime.sendMessage(
          { action: "extract_content", tabId: response.tabId },
          (contentResponse) => {
            if (contentResponse && contentResponse.content) {
              chrome.runtime.sendMessage(
                { action: "summarize_page", content: contentResponse.content },
                (summarizeResponse) => {
                  if (
                    summarizeResponse &&
                    summarizeResponse.questionAnswerPairs
                  ) {
                    setQuestionAnswerPairs(
                      summarizeResponse.questionAnswerPairs
                    );
                  }
                }
              );
            }
          }
        );
      } else {
        console.error("Failed to get active tab:", chrome.runtime.lastError);
      }
    });
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
        <button
          onClick={handleGenerateQuestions}
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Generate Questions
        </button>
        {questionAnswerPairs.length > 0 && (
          <div>
            {questionAnswerPairs.map((pair, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h4>Question {index + 1}:</h4>
                <p>{pair.question}</p>
                <h4>Answer:</h4>
                <p>{pair.answer}</p>
              </div>
            ))}
          </div>
        )}
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
