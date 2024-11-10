// Sidebar.tsx
import React from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, summary }) => {
  const formatSummary = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("##")) {
        return <h4 key={index}>{line.substring(2).trim()}</h4>;
      } else if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={index}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      } else {
        return <p key={index}>{line}</p>;
      }
    });
  };

  return (
    <div
      style={{
        width: "350px",
        height: "700px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "rgba(0, 0, 0, 0.5) 0px 0px 15px",
        zIndex: 1001,
        display: isOpen ? "block" : "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1002,
          cursor: "pointer",
        }}
      >
        Close
      </button>
      <div
        style={{
          padding: "10px",
          overflowY: "auto",
          height: "calc(100% - 40px)",
        }}
      >
        {formatSummary(summary)}
      </div>
    </div>
  );
};

export default Sidebar;
