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
import "../styles/MindMap.css";
import { Background } from "reactflow";

interface MindMapProps {
  siteData: { title: string; entries: any[]; siteUrl?: string };
  onGoBack: () => void;
}

type DataType = {
  label: string;
  onContentChange: (content: string) => void;
  onLearnMore: () => void;
};

const AnswerNode = ({ data }: { data: DataType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.label);

  const handleSave = () => {
    setIsEditing(false);
    data.onContentChange(editedContent);
  };

  return (
    <div className="answer-node">
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <div className="edit-mode">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{ width: "100%", height: "80px" }}
          />
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      ) : (
        <div className="content">
          <div className="answer-content">{data.label}</div>
          <div className="answer-buttons">
            <button
              onClick={() => setIsEditing(true)}
              className="answer-node-edit-button"
            >
              Edit
            </button>
            <button
              onClick={data.onLearnMore}
              className="answer-node-learn-more"
            >
              Learn More
            </button>
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
const ExploreNode = ({
  data,
}: {
  data: { label: string; onClose: () => void };
}) => {
  return (
    <div className="explore-node">
      <Handle type="target" position={Position.Left} />
      <div className="content">
        <div className="explore-content">{data.label}</div>
        <div className="buttons">
          <button onClick={data.onClose} className="explore-node-close-button">
            Close
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const MindMap: React.FC<MindMapProps> = ({ siteData, onGoBack }) => {
  const [currentSiteData, setCurrentSiteData] = useState(siteData);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [expandedAnswer, setExpandedAnswer] = useState<string | null>(null);
  const [expandedExplore, setExpandedExplore] = useState<string | null>(null);

  const reading = chrome.runtime.getURL("./public/reading.png");

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
  }, [currentSiteData, expandedAnswer, expandedExplore]);

  const handleQuestionClick = (id: string) => {
    setExpandedAnswer((prevExpandedAnswer) =>
      prevExpandedAnswer === id ? null : id
    );
    setExpandedExplore(null);
  };

  const handleLearnMoreClick = (id: string) => {
    setExpandedExplore((prevExpandedExplore) =>
      prevExpandedExplore === id ? null : id
    );
  };

  const handleCloseExploreNode = () => {
    setExpandedExplore(null);
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
        type: "defaultNode",
        data: { label: currentSiteData.title },
        position: { x: -900, y: 300 },
      },
      ...currentSiteData.entries.map((entry, index) => ({
        id: `question-${index}`,
        type: "defaultNode",
        data: { label: entry.question },
        position: { x: -400, y: (index + 1) * 150 },
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
          position: { x: 0, y: (index + 1) * 150 },
          hidden: expandedAnswer !== `question-${index}`,
        },
        {
          id: `explore-${index}`,
          type: "exploreNode",
          data: {
            label: entry.explore,
            onClose: handleCloseExploreNode,
          },
          position: { x: 400, y: (index + 1) * 150 },
          hidden: expandedExplore !== `answer-${index}`,
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
          hidden: expandedAnswer !== `question-${index}`,
        },
        {
          id: `e-answer-${index}-explore-${index}`,
          source: `answer-${index}`,
          target: `explore-${index}`,
          hidden: expandedExplore !== `answer-${index}`,
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
    [setNodes, expandedAnswer, expandedExplore]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const DefaultNode = ({ data }: { data: DataType }) => (
    <div className="default-node">
      <Handle type="target" position={Position.Left} />
      <div className="default-node-content">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );

  const nodeTypes = {
    defaultNode: DefaultNode,
    answerNode: AnswerNode,
    exploreNode: ExploreNode,
  };

  return (
    <div>
      <div className="mindmap-header">
        <button className="back-button" onClick={onGoBack}>
          Back
        </button>
        <h1 className="header-title">SUMMARY</h1>
      </div>
      <img src={reading} alt="Reading" className="reading-image" />
      <div className="mindmap-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: "smoothstep" }}
          fitView
        />
      </div>
    </div>
  );
};

export default MindMap;
