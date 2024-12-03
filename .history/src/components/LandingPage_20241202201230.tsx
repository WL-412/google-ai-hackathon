import React from "react";
import "../styles/Sidebar.css";

const LandingPage = ({ setCurrentPage, handleStartHunt }) => {
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
      <div className="background-figure figure-top-left"></div>
      <div className="background-figure figure-above-button"></div>
    </div>
  );
};

export default LandingPage;
