import React, { useState, useEffect } from "react";
import MindMap from "./MindMap";
import "../styles/HistoryLibrary.css";

const HistoryLibrary: React.FC = () => {
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

  return (
    <div>
      {selectedSite ? (
        <MindMap
          siteData={history[selectedSite]}
          onGoBack={() => setSelectedSite(null)}
        />
      ) : (
        <div>
          <h3>My Library</h3>
          <div>
            <h4>Websites:</h4>
            <ul className="website-list">
              {Object.keys(history).map((site) => (
                <li
                  key={site}
                  onClick={() => setSelectedSite(site)}
                  className="website-item"
                >
                  <h5 className="website-title">{history[site].title}</h5>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryLibrary;
