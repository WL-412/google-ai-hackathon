import React from "react";
import "../styles/FinishQuizPage.css";

interface FinishQuizPageProps {
  onBackToHome: () => void;
  onViewSummary: () => void;
  questionsCount: number;
  points: number;
}

const FinishQuizPage: React.FC<FinishQuizPageProps> = ({
  onBackToHome,
  onViewSummary,
  questionsCount,
  points,
}) => {
  return (
    <div className="finish-quiz-page">
      <h1 className="finish-title">YOU ROCK!</h1>
      <p className="finish-subtitle">Don't forget to review the hunt summary</p>
      <div className="finish-stats">
        <div className="finish-stat">
          <span>{questionsCount}</span>
          <p>questions</p>
        </div>
        <div className="finish-stat">
          <span>{points}</span>
          <p>points</p>
        </div>
      </div>
      <div className="finish-character"></div>
      <div className="finish-actions">
        <button className="finish-button white" onClick={onBackToHome}>
          Back to Home Page
        </button>
        <button className="finish-button black" onClick={onViewSummary}>
          View Hunt Summary
        </button>
      </div>
    </div>
  );
};

export default FinishQuizPage;
