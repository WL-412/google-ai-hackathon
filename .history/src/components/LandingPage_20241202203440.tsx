import React from "react";
import "../styles/LandingPage.css"; // External CSS file for styling

interface LandingPageProps {
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
  handleStartHunt: () => void;
}

type Page = "landing" | "library" | "hunt" | "mindmap" | "loading" | "finish";

const LandingPage: React.FC<LandingPageProps> = ({
  setCurrentPage,
  handleStartHunt,
}) => {
  return (
    <div className="landing-page">
      {/* Title Image */}
      <div className="title-container">
        <img
          src={chrome.runtime.getURL("public/landing-page/Hive.png")} // Path to title image
          alt="Welcome Title"
          className="title-image"
        />
      </div>

      {/* Buttons at the Bottom */}
      <div className="button-container">
        <button
          className="button-library"
          onClick={() => setCurrentPage("library")}
        >
          My Library
        </button>
        <button className="button-hunt" onClick={handleStartHunt}>
          Start a Hunt
        </button>
      </div>

      {/* Background Figures */}
      <div
        className="background-figure figure-top-left"
        style={{
          backgroundImage: `url(${chrome.runtime.getURL(
            "public/figure1.png"
          )})`,
        }}
      ></div>
      <div
        className="background-figure figure-above-button"
        style={{
          backgroundImage: `url(${chrome.runtime.getURL(
            "public/figure2.png"
          )})`,
        }}
      ></div>
    </div>
  );
};

export default LandingPage;
