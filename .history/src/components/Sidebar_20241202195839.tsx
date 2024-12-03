import React, { useState, useEffect } from "react";
import Questionnaire from "./Questionnaire";
import HistoryLibrary from "./HistoryLibrary";
import MindMap from "./MindMap";
import LoadingPage from "./LoadingPage";
import "../styles/Sidebar.css";
import CloseIcon from "@mui/icons-material/Close";
import FinishQuizPage from "./FinishQuizPage";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  width: number;
  setWidth: (width: number) => void;
};

type Page = "landing" | "library" | "hunt" | "mindmap" | "loading" | "finish";

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  width,
  setWidth,
}) => {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedSiteData, setSelectedSiteData] = useState<{
    title: string;
    entries: any[];
  } | null>(null);
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState<
    { question: string; answer: string }[]
  >([]);
  const [points, setPoints] = useState<number>(0);

  const handleFinishHunt = () => {
    setPoints(questionAnswerPairs.length * 25);
    setCurrentPage("finish");
  };

  const handleStartHunt = () => {
    setCurrentPage("loading");

    chrome.runtime.sendMessage({ action: "get_active_tab" }, (response) => {
      if (response && response.tabId) {
        chrome.runtime.sendMessage(
          { action: "extract_content", tabId: response.tabId },
          (contentResponse) => {
            if (contentResponse && contentResponse.content) {
              chrome.runtime.sendMessage(
                {
                  action: "summarize_page",
                  content: contentResponse.content,
                },
                (summarizeResponse) => {
                  if (
                    summarizeResponse &&
                    summarizeResponse.questionAnswerPairs
                  ) {
                    setQuestionAnswerPairs(
                      summarizeResponse.questionAnswerPairs
                    );
                    setCurrentPage("hunt");
                  } else {
                    console.error("Failed to generate questions");
                    setCurrentPage("landing");
                  }
                }
              );
            } else {
              console.error("Failed to extract content");
              setCurrentPage("landing");
            }
          }
        );
      } else {
        console.error("Failed to get active tab:", chrome.runtime.lastError);
        setCurrentPage("landing");
      }
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <div className="landing-page">
            <h3>Welcome!</h3>
            <button
              className="extension-button"
              onClick={() => setCurrentPage("library")}
            >
              My Library
            </button>
            <button className="extension-button" onClick={handleStartHunt}>
              Start a Hunt
            </button>
          </div>
        );
      case "library":
        return (
          <HistoryLibrary
            onBack={() => setCurrentPage("landing")}
            onSelectSite={(siteData) => {
              setSelectedSiteData(siteData);
              setCurrentPage("mindmap");
            }}
            onStartHunt={handleStartHunt}
          />
        );
      case "hunt":
        return (
          <Questionnaire
            questionAnswerPairs={questionAnswerPairs}
            onFinish={handleFinishHunt}
          />
        );
      case "mindmap":
        return (
          selectedSiteData && (
            <MindMap
              siteData={selectedSiteData}
              onGoBack={() => {
                setCurrentPage("library");
                setWidth(400);
              }}
              onEnlarge={() => {
                if (width === 400) {
                  setWidth(1320);
                } else {
                  setWidth(400);
                }
              }}
            />
          )
        );
      case "loading":
        return <LoadingPage />;
      case "finish":
        return (
          <FinishQuizPage
            onBackToHome={() => setCurrentPage("landing")}
            onViewSummary={() => setCurrentPage("library")}
            questionsCount={8}
            points={points}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`extension-sidebar ${isOpen ? "open" : ""}`}
      style={{
        height: '60px',
        width: `${width}px`,
      }}
    >
      <button className="extension-sidebar-close" onClick={onClose}>
        <CloseIcon />
      </button>
      <div className="extension-sidebar-content">{renderPage()}</div>
    </div>
  );
};

export default Sidebar;
