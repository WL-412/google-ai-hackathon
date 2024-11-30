import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
  Node,
  Edge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FitScreenIcon from "@mui/icons-material/FitScreen";

interface MindMapProps {
  siteData: { title: string; entries: any[]; siteUrl?: string };
  onGoBack: () => void;
  onEnlarge: () => void;
}
const AnswerNode = ({
  data,
}: {
  data: {
    label: string;
    onContentChange: (content: string) => void;
    onLearnMore: () => void;
  };
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.label);

  const handleSave = () => {
    setIsEditing(false);
    data.onContentChange(editedContent);
  };

  return (
    <div className="react-flow__node-default">
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <div>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{ width: "100%", height: "60px" }}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          <div>{data.label}</div>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={data.onLearnMore}>Learn More</button>
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const MindMap: React.FC<MindMapProps> = ({ siteData, onGoBack, onEnlarge }) => {
  const [currentSiteData, setCurrentSiteData] = useState(siteData);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(
    new Set()
  );
  const [expandedExplore, setExpandedExplore] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("history", (result) => {
        const history = result.history || {};

        const siteUrl = siteData.siteUrl || window.location.origin;

        if (history[siteUrl]) {
          setCurrentSiteData(history[siteUrl]);
        } else {
          setCurrentSiteData(siteData);
        }
      });
    } else {
      setCurrentSiteData(siteData);
    }
  }, [siteData]);

  useEffect(() => {
    setNodes(generateInitialNodes());
    setEdges(generateInitialEdges());
  }, [currentSiteData, expandedAnswers, expandedExplore]);

  const handleQuestionClick = (id: string) => {
    const questionIndex = id.split("-")[1];

    setExpandedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

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

  const handleLearnMoreClick = (id: string) => {
    const answerIndex = id.split("-")[1];

    setExpandedExplore((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAnswerContentChange = (index: number, newContent: string) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === `answer-${index}`) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newContent,
            },
          };
        }
        return node;
      })
    );

    setCurrentSiteData((prevSiteData) => {
      const newEntries = [...prevSiteData.entries];
      newEntries[index] = {
        ...newEntries[index],
        userAnswer: newContent,
      };
      const updatedSiteData = {
        ...prevSiteData,
        entries: newEntries,
      };
      saveDataToChromeStorage({
        ...updatedSiteData,
        siteUrl: window.location.origin,
      });

      return updatedSiteData;
    });
  };

  const saveDataToChromeStorage = (data: {
    entries?: any[];
    title?: string;
    siteUrl: any;
  }) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("history", (result) => {
        const history = result.history || {};

        const siteUrl = data.siteUrl || window.location.origin;

        history[siteUrl] = data;

        chrome.storage.local.set({ history }, () => {
          console.log(`Data saved to Chrome storage for ${siteUrl}`);
        });
      });
    }
  };

  const generateInitialNodes = () => {
    const nodes: Node[] = [
      {
        id: "root",
        data: { label: currentSiteData.title },
        position: { x: -300, y: 300 },
      },
      ...currentSiteData.entries.map((entry, index) => ({
        id: `question-${index}`,
        data: { label: entry.question },
        position: { x: -100, y: (index + 1) * 150 },
        style: { cursor: "pointer" },
      })),
      ...currentSiteData.entries.flatMap((entry, index) => [
        {
          id: `answer-${index}`,
          type: "answerNode",
          data: {
            label: entry.userAnswer || entry.answer,
            onLearnMore: () => handleLearnMoreClick(`answer-${index}`),
            onContentChange: (newContent: string) =>
              handleAnswerContentChange(index, newContent),
          },
          position: { x: 100, y: (index + 1) * 150 },
          hidden: !expandedAnswers.has(`question-${index}`),
        },
        {
          id: `explore-${index}`,
          data: { label: entry.explore },
          position: { x: 300, y: (index + 1) * 150 },
          hidden: !expandedExplore.has(`answer-${index}`),
          style: { width: "300px" },
        },
      ]),
    ];
    return nodes;
  };

  const generateInitialEdges = () => {
    const edges: Edge[] = [
      ...currentSiteData.entries.map((_, index) => ({
        id: `e-root-question-${index}`,
        source: "root",
        target: `question-${index}`,
      })),
      ...currentSiteData.entries.flatMap((_, index) => [
        {
          id: `e-question-${index}-answer-${index}`,
          source: `question-${index}`,
          target: `answer-${index}`,
          hidden: !expandedAnswers.has(`question-${index}`),
        },
        {
          id: `e-answer-${index}-explore-${index}`,
          source: `answer-${index}`,
          target: `explore-${index}`,
          hidden: !expandedExplore.has(`answer-${index}`),
        },
      ]),
    ];
    return edges;
  };

  const onNodesChange = useCallback(
    (changes: any[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      changes.forEach((change) => {
        if (change.type === "select" && change.selected) {
          if (change.id.startsWith("question-")) {
            handleQuestionClick(change.id);
          }
        }
      });
    },
    [setNodes, expandedAnswers, expandedExplore]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const nodeTypes = {
    answerNode: AnswerNode,
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
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </div>
  );
};

export default MindMap;
