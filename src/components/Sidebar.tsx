// Sidebar.tsx
import React, { useState, useEffect } from "react";
import Questionnaire from "./Questionnaire";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, summary }) => {
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState<
    { question: string; answer: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    chrome.runtime.sendMessage({ action: "get_active_tab" }, (response) => {
      if (response && response.tabId) {
        chrome.runtime.sendMessage(
          { action: "extract_content", tabId: response.tabId },
          (contentResponse) => {
            if (contentResponse && contentResponse.content) {
              chrome.runtime.sendMessage(
                { action: "summarize_page", content: contentResponse.content },
                (summarizeResponse) => {
                  setIsLoading(false);
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
            } else {
              setIsLoading(false);
            }
          }
        );
      } else {
        console.error("Failed to get active tab:", chrome.runtime.lastError);
        setIsLoading(false);
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
        {isLoading && <p>Generating...</p>}
        {!isLoading && questionAnswerPairs.length > 0 && (
          <div>
            <Questionnaire questionAnswerPairs={questionAnswerPairs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
