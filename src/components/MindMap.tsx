import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

interface MindMapProps {
  siteData: { title: string; entries: any[] };
  onGoBack: () => void;
}

const MindMap: React.FC<MindMapProps> = ({ siteData, onGoBack }) => {
  const [nodes, setNodes] = useState(() => generateInitialNodes(siteData));
  const [edges, setEdges] = useState(() => generateInitialEdges(siteData));
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const onNodesChange = useCallback(
    (changes: any[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      changes.forEach((change) => {
        if (change.type === "select" && change.selected) {
          handleQuestionClick(change.id);
        }
      });
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<{ id: string; source: string; target: string }>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const handleQuestionClick = (id: string) => {
    if (!id.startsWith("question-")) return;

    const questionIndex = id.split("-")[1];

    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (
            node.id === `answer-${questionIndex}` ||
            node.id === `feedback-${questionIndex}`
          ) {
            return { ...node, hidden: !newSet.has(id) };
          }
          return node;
        })
      );

      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          if (
            edge.id === `e-question-${questionIndex}-answer-${questionIndex}` ||
            edge.id === `e-answer-${questionIndex}-feedback-${questionIndex}`
          ) {
            return { ...edge, hidden: !newSet.has(id) };
          }
          return edge;
        })
      );

      console.log("newSet", newSet);
      return newSet;
    });
  };

  return (
    <div>
      <button
        onClick={onGoBack}
        style={{ position: "absolute", top: 10, left: 10 }}
      >
        <ArrowBackIosIcon /> Back
      </button>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        />
      </div>
    </div>
  );
};

const generateInitialNodes = (siteData: { title: string; entries: any[] }) => {
  const nodes = [
    {
      id: "root",
      data: { label: siteData.title },
      position: { x: -200, y: 300 },
    },
    ...siteData.entries.map((entry, index) => ({
      id: `question-${index}`,
      data: { label: entry.question },
      position: { x: 0, y: (index + 1) * 100 },
      style: { cursor: "pointer" },
    })),
    ...siteData.entries.flatMap((entry, index) => [
      {
        id: `answer-${index}`,
        data: { label: entry.userAnswer },
        position: { x: 200, y: (index + 1) * 100 },
        hidden: true,
      },
      {
        id: `feedback-${index}`,
        data: { label: entry.answer },
        position: { x: 400, y: (index + 1) * 100 },
        hidden: true,
      },
    ]),
  ];
  return nodes;
};

const generateInitialEdges = (siteData: { title: string; entries: any[] }) => {
  const edges = [
    ...siteData.entries.map((_, index) => ({
      id: `e-root-question-${index}`,
      source: "root",
      target: `question-${index}`,
    })),
    ...siteData.entries.flatMap((_, index) => [
      {
        id: `e-question-${index}-answer-${index}`,
        source: `question-${index}`,
        target: `answer-${index}`,
        hidden: true,
      },
      {
        id: `e-answer-${index}-feedback-${index}`,
        source: `answer-${index}`,
        target: `feedback-${index}`,
        hidden: true,
      },
    ]),
  ];
  return edges;
};

export default MindMap;
