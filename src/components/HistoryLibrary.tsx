import React, { useState, useEffect } from "react";
import MindMap from "./MindMap";
import "../styles/HistoryLibrary.css";

type HistoryLibraryProps = {
  onBack: () => void;
};

const HistoryLibrary: React.FC<HistoryLibraryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<{
    [key: string]: { title: string; entries: any[] };
  }>({});
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "get_history" }, (response) => {
      if (response.success) {
        setHistory(response.history);
      }
    });
  }, []);

  if (selectedSite) {
    return (
      <MindMap
        siteData={history[selectedSite]}
        onGoBack={() => setSelectedSite(null)}
      />
    );
  }

  return (
    <div className="history-library">
      <button onClick={onBack} className="back-button">
        Back
      </button>
      <h3>My Library</h3>
      <ul className="website-list">
        {Object.keys(history).map((site) => (
          <li
            key={site}
            onClick={() => setSelectedSite(site)}
            className="website-item"
          >
            <h5>{history[site].title}</h5>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryLibrary;
