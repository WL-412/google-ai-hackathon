import React from "react";
import "../styles/FinishQuizPage.css";

interface FinishQuizPageProps {
  onBackToHome: () => void;
  onViewSummary: () => void;
  questionsCount: number;
}

const FinishQuizPage: React.FC<FinishQuizPageProps> = ({
  onBackToHome,
  onViewSummary,
  questionsCount,
}) => {
  const background = chrome.runtime.getURL("./public/FinishQuizPage.png");
  const standingLogo = chrome.runtime.getURL(
    "./public/landing-page/above-button.png"
  );

  return (
    <div
      className="finish-quiz-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="finish-content">
        <div className="finish-points">
          <span>{questionsCount}</span>
          <p>questions</p>
        </div>
        <img src={standingLogo} alt="Character Logo" className="finish-logo" />
        <div className="finish-actions">
          <button className="finish-button white" onClick={onBackToHome}>
            Back to Home Page
          </button>
          <button className="finish-button black" onClick={onViewSummary}>
            View Hunt Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishQuizPage;
