import React, { useState, useEffect } from "react";
import Questionnaire from "./Questionnaire";
import HistoryLibrary from "./HistoryLibrary";
import MindMap from "./MindMap";
import LoadingPage from "./LoadingPage";
import "../styles/Sidebar.css";
import CloseIcon from "@mui/icons-material/Close";
import FinishQuizPage from "./FinishQuizPage";
import LandingPage from "./LandingPage";
import MinimizeIcon from "@mui/icons-material/Minimize";

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
  // Initialize state variables
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedSiteData, setSelectedSiteData] = useState<{
    title: string;
    entries: any[];
  } | null>(null);
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState<
    { question: string; answer: string }[]
  >([]);

  // Load state from chrome.storage.local when the component mounts
  useEffect(() => {
    chrome.storage.local.get(
      ["currentPage", "selectedSiteData", "questionAnswerPairs"],
      (result) => {
        if (result.currentPage) setCurrentPage(result.currentPage);
        if (result.selectedSiteData)
          setSelectedSiteData(result.selectedSiteData);
        if (result.questionAnswerPairs)
          setQuestionAnswerPairs(result.questionAnswerPairs);
        // If no state is found, defaults will be used
      }
    );
  }, []);

  const handleMinimize = () => {
    onClose(); // This function hides the sidebar
  };

  const handleClose = () => {
    // Remove the stored state keys from chrome.storage.local
    chrome.storage.local.remove(
      ["currentPage", "selectedSiteData", "questionAnswerPairs"],
      () => {
        // Reset the state variables to their initial values
        setCurrentPage("landing");
        setSelectedSiteData(null);
        setQuestionAnswerPairs([]);
        // Hide the sidebar
        onClose();
      }
    );
  };

  // Save state to chrome.storage.local whenever it changes
  useEffect(() => {
    chrome.storage.local.set({
      currentPage,
      selectedSiteData,
      questionAnswerPairs,
    });
  }, [currentPage, selectedSiteData, questionAnswerPairs]);

  // Adjust the width based on the currentPage
  useEffect(() => {
    if (currentPage === "mindmap") {
      setWidth(1320);
    } else {
      setWidth(400);
    }
  }, [currentPage, setWidth]);

  const handleFinishHunt = () => {
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
          <LandingPage
            setCurrentPage={setCurrentPage}
            handleStartHunt={handleStartHunt}
          />
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`extension-sidebar ${isOpen ? "open" : ""}`}
      style={{ width: `${width}px` }}
    >
      <button className="extension-sidebar-minimize" onClick={handleMinimize}>
        <MinimizeIcon />
      </button>
      <button className="extension-sidebar-close" onClick={handleClose}>
        <CloseIcon />
      </button>
      <div className="extension-sidebar-content">{renderPage()}</div>
    </div>
  );
};

export default Sidebar;
