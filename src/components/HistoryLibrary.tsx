import React, { useState, useEffect } from "react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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

  const generateFlowElements = () => {
    if (!selectedSite) return { nodes: [], edges: [] };

    const siteData = history[selectedSite];
    const nodes = [];
    const edges: { id: string; source: string; target: string }[] = [];

    nodes.push({
      id: "root",
      data: { label: siteData.title },
      position: { x: -200, y: 300 },
    });

    siteData.entries.forEach((entry, index) => {
      const questionId = `question-${index}`;
      const answerId = `answer-${index}`;
      const feedbackId = `feedback-${index}`;

      // Question node
      nodes.push({
        id: questionId,
        data: { label: `${entry.question}` },
        position: { x: 0, y: (index + 1) * 100 },
      });

      // User Answer node
      nodes.push({
        id: answerId,
        data: { label: `${entry.userAnswer}` },
        position: { x: 200, y: (index + 1) * 100 },
      });

      // Feedback node
      nodes.push({
        id: feedbackId,
        data: { label: `${entry.answer}` },
        position: { x: 400, y: (index + 1) * 100 },
      });

      // Edges
      edges.push({
        id: `e-root-${questionId}`,
        source: "root",
        target: questionId,
      });
      edges.push({
        id: `e-${questionId}-${answerId}`,
        source: questionId,
        target: answerId,
      });
      edges.push({
        id: `e-${answerId}-${feedbackId}`,
        source: answerId,
        target: feedbackId,
      });
    });

    return { nodes, edges };
  };

  const { nodes, edges } = generateFlowElements();

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
              {history[site].title}
            </li>
          ))}
        </ul>
      </div>
      {selectedSite && (
        <ReactFlow nodes={nodes} edges={edges} nodesDraggable={true} />
      )}
    </div>
  );
};

export default HistoryLibrary;
