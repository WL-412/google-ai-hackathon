import React, { useState, useEffect } from "react";

const HistoryLibrary: React.FC = () => {
  const [history, setHistory] = useState<{ [key: string]: any[] }>({});
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
      <h3>My Library</h3>
      <div>
        <h4>Websites:</h4>
        <ul>
          {Object.keys(history).map((site) => (
            <li
              key={site}
              onClick={() => setSelectedSite(site)}
              style={{ cursor: "pointer" }}
            >
              {site}
            </li>
          ))}
        </ul>
      </div>
      {selectedSite && (
        <div>
          <h4>History for {selectedSite}</h4>
          <ul>
            {history[selectedSite].map((entry, index) => (
              <li key={index}>
                <p>
                  <strong>Question:</strong> {entry.question}
                </p>
                <p>
                  <strong>User Answer:</strong> {entry.userAnswer}
                </p>
                <p>
                  <strong>Feedback:</strong> {entry.answer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HistoryLibrary;
