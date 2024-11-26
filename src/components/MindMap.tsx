import React from "react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

interface MindMapProps {
  siteData: { title: string; entries: any[] };
  onGoBack: () => void;
}

const MindMap: React.FC<MindMapProps> = ({ siteData, onGoBack }) => {
  const generateFlowElements = () => {
    const nodes = [];
    const edges: { id: string; source: string; target: string }[] = [];

    // Root node for the website
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
    <div>
      <button
        onClick={onGoBack}
        style={{ position: "absolute", top: 10, left: 10 }}
      >
        <ArrowBackIosIcon /> Back
      </button>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow nodes={nodes} edges={edges} nodesDraggable={true} />
      </div>
    </div>
  );
};

export default MindMap;
