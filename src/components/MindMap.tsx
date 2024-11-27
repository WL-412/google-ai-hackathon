import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FitScreenIcon from "@mui/icons-material/FitScreen";

interface MindMapProps {
  siteData: { title: string; entries: any[] };
  onGoBack: () => void;
  onEnlarge: () => void;
}

const MindMap: React.FC<MindMapProps> = ({ siteData, onGoBack, onEnlarge }) => {
  const [nodes, setNodes] = useState(() => generateInitialNodes(siteData));
  const [edges, setEdges] = useState(() => generateInitialEdges(siteData));
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(
    new Set()
  );
  const [expandedExplore, setExpandedExplore] = useState<Set<string>>(
    new Set()
  );

  const onNodesChange = useCallback(
    (changes: any[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      changes.forEach((change) => {
        if (change.type === "select" && change.selected) {
          if (change.id.startsWith("question-")) {
            handleQuestionClick(change.id);
          } else if (change.id.startsWith("answer-")) {
            handleAnswerClick(change.id);
          }
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
    const questionIndex = id.split("-")[1];

    setExpandedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === `answer-${questionIndex}`) {
            return { ...node, hidden: !newSet.has(id) };
          }
          if (node.id === `explore-${questionIndex}`) {
            return { ...node, hidden: true };
          }
          return node;
        })
      );

      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          if (
            edge.id === `e-question-${questionIndex}-answer-${questionIndex}`
          ) {
            return { ...edge, hidden: !newSet.has(id) };
          }
          if (
            edge.id === `e-answer-${questionIndex}-explore-${questionIndex}`
          ) {
            return { ...edge, hidden: true };
          }
          return edge;
        })
      );

      if (!newSet.has(id)) {
        setExpandedExplore((prevExplore) => {
          const exploreSet = new Set(prevExplore);
          exploreSet.delete(`answer-${questionIndex}`);
          return exploreSet;
        });
      }

      return newSet;
    });
  };

  const handleAnswerClick = (id: string) => {
    const answerIndex = id.split("-")[1];

    setExpandedExplore((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === `explore-${answerIndex}`) {
            return { ...node, hidden: !newSet.has(id) };
          }
          return node;
        })
      );

      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          if (edge.id === `e-answer-${answerIndex}-explore-${answerIndex}`) {
            return { ...edge, hidden: !newSet.has(id) };
          }
          return edge;
        })
      );

      return newSet;
    });
  };

  return (
    <div>
      <button
        onClick={onGoBack}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 2147483647 }}
      >
        <ArrowBackIosIcon /> Back
      </button>
      <button
        onClick={onEnlarge}
        style={{
          position: "absolute",
          top: 10,
          right: 50,
          zIndex: 2147483647,
          cursor: "pointer",
        }}
      >
        <FitScreenIcon />
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
      position: { x: -300, y: 300 },
    },
    ...siteData.entries.map((entry, index) => ({
      id: `question-${index}`,
      data: { label: entry.question },
      position: { x: -100, y: (index + 1) * 150 },
      style: { cursor: "pointer" },
    })),
    ...siteData.entries.flatMap((entry, index) => [
      {
        id: `answer-${index}`,
        data: { label: entry.userAnswer },
        position: { x: 100, y: (index + 1) * 150 },
        hidden: true,
        style: { cursor: "pointer" },
      },
      {
        id: `explore-${index}`,
        data: { label: entry.explore },
        position: { x: 300, y: (index + 1) * 150 },
        hidden: true,
        style: { width: "300px" },
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
        id: `e-answer-${index}-explore-${index}`,
        source: `answer-${index}`,
        target: `explore-${index}`,
        hidden: true,
      },
    ]),
  ];
  return edges;
};

export default MindMap;
