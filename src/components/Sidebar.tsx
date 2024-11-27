import React, { useState, useEffect } from "react";
import Questionnaire from "./Questionnaire";
import HistoryLibrary from "./HistoryLibrary";
import "../styles/Sidebar.css";
import CloseIcon from "@mui/icons-material/Close";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Page = "landing" | "library" | "hunt";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

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
            <button
              className="extension-button"
              onClick={() => setCurrentPage("hunt")}
            >
              Start a Hunt
            </button>
          </div>
        );
      case "library":
        return <HistoryLibrary onBack={() => setCurrentPage("landing")} />;
      case "hunt":
        return <Questionnaire onBack={() => setCurrentPage("landing")} />;
      default:
        return null;
    }
  };

  return (
    <div className={`extension-sidebar ${isOpen ? "open" : ""}`}>
      <button className="extension-sidebar-close" onClick={onClose}>
        <CloseIcon />
      </button>
      <div className="extension-sidebar-content">{renderPage()}</div>
    </div>
  );
};

export default Sidebar;
