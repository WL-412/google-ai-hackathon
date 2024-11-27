import React, { useState, useEffect } from "react";
import "../styles/HistoryLibrary.css";

type HistoryLibraryProps = {
  onBack: () => void;
  onSelectSite: (siteData: { title: string; entries: any[] }) => void;
};

const HistoryLibrary: React.FC<HistoryLibraryProps> = ({
  onBack,
  onSelectSite,
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
            onClick={() => handleSiteClick(site)}
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
