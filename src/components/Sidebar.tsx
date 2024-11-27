import React, { useState } from "react";
import Questionnaire from "./Questionnaire";
import HistoryLibrary from "./HistoryLibrary";
import MindMap from "./MindMap";
import "../styles/Sidebar.css";
import CloseIcon from "@mui/icons-material/Close";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  width: number;
  setWidth: (width: number) => void;
};

type Page = "landing" | "library" | "hunt" | "mindmap";

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
        return (
          <HistoryLibrary
            onBack={() => setCurrentPage("landing")}
            onSelectSite={(siteData) => {
              setSelectedSiteData(siteData);
              setCurrentPage("mindmap");
            }}
          />
        );
      case "hunt":
        return <Questionnaire onBack={() => setCurrentPage("landing")} />;
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
      default:
        return null;
    }
  };

  return (
    <div
      className={`extension-sidebar ${isOpen ? "open" : ""}`}
      style={{
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
