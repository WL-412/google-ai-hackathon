import React from "react";
import "./Sidebar.css"; // External CSS file for styling

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
          src={chrome.runtime.getURL("public/title.png")} // Path to title image
          alt="Welcome Title"
          className="title-image"
        />
      </div>

      {/* Buttons at the Bottom */}
      <div className="button-container">
        <button
          className="extension-button"
          onClick={() => setCurrentPage("library")}
        >
          My Library
        </button>
        <button className="extension-button" onClick={handleStartHunt}>
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
