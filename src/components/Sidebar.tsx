import React, { useState, useEffect } from "react";
import Questionnaire from "./Questionnaire";
import HistoryLibrary from "./HistoryLibrary";
import "../styles/Sidebar.css";
import CloseIcon from "@mui/icons-material/Close";

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
  const [view, setView] = useState<"questions" | "history">("questions");

  useEffect(() => {
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
    <div className={`extension-sidebar ${isOpen ? "open" : ""}`}>
      <button className="extension-sidebar-close" onClick={onClose}>
        <CloseIcon />
      </button>
      <div className="extension-sidebar-content">
        <h3>LET'S DO THIS</h3>
        <div className="extension-view-toggle">
          <button
            className={`extension-toggle-button ${
              view === "questions" ? "active" : ""
            }`}
            onClick={() => setView("questions")}
          >
            Questions
          </button>
          <button
            className={`extension-toggle-button ${
              view === "history" ? "active" : ""
            }`}
            onClick={() => setView("history")}
          >
            History
          </button>
        </div>
        {view === "questions" && (
          <div>
            <button
              className="extension-generate-button"
              onClick={handleGenerateQuestions}
            >
              Generate Questions
            </button>
            {isLoading && (
              <p className="extension-loading-text">Generating...</p>
            )}
            {!isLoading && questionAnswerPairs.length > 0 && (
              <Questionnaire questionAnswerPairs={questionAnswerPairs} />
            )}
          </div>
        )}
        {view === "history" && <HistoryLibrary />}
      </div>
    </div>
  );
};

export default Sidebar;
