import React, { useState, useEffect } from "react";
import "../styles/HistoryLibrary.css";

type HistoryLibraryProps = {
  onBack: () => void;
  onSelectSite: (siteData: { title: string; entries: any[] }) => void;
  onStartHunt: () => void;
};

const HistoryLibrary: React.FC<HistoryLibraryProps> = ({
  onBack,
  onSelectSite,
  onStartHunt,
}) => {
  const [history, setHistory] = useState<{
    [key: string]: { title: string; entries: any[] };
  }>({});

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "get_history" }, (response) => {
      if (response.success) {
        setHistory(response.history);
      }
    });
  }, []);

  const handleSiteClick = (site: string) => {
    onSelectSite(history[site]);
  };

  const isEmpty = Object.keys(history).length === 0;
  const librarylogo = chrome.runtime.getURL("./public/anime/小3动画(1).gif");

  return (
    <div className="history-library">
      <button onClick={onBack} className="back-button">
        Back
      </button>
      <h3 className="library-title">HUNT LIBRARY</h3>

      {isEmpty ? (
        <div className="empty-library">
          <div className="empty-square">
            <div className="oops-illustration">
              <img src={librarylogo} alt="Oops" className="oops-image" />
            </div>
            <h4 className="oops-title">Oops</h4>
            <p className="oops-subtitle">You don't have any hunt yet</p>
          </div>
          <button className="start-hunt-button" onClick={onStartHunt}>
            Start a hunt
          </button>
        </div>
      ) : (
        <>
          <div className="list-gif">
            <img src={librarylogo} alt="List Animation" className="list-gif-image" />
          </div>
          <ul className="website-list">
            {Object.keys(history).map((site) => (
              <li
                key={site}
                onClick={() => handleSiteClick(site)}
                className="website-item"
              >
                <h5>{history[site].title}</h5>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HistoryLibrary;
