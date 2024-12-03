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

  {/* Create Font Style at Runtime */ }
  const fontUrl = chrome.runtime.getURL('public/Synonym_Complete/Fonts/TTF/Synonym-Variable.ttf');
  const style = document.createElement('style');
  style.textContent = `
  @font-face {
    font-family: 'CustomFont';
    src: url('${fontUrl}') format('truetype');
  }

  .title-text {
    font-family: 'CustomFont', sans-serif;
  }

    .button-library {
    font-family: 'CustomFont', sans-serif;
  }

    .button-hunt {
    font-family: 'CustomFont', sans-serif;
  }
`;
  document.head.appendChild(style);

  return (
    <div className="landing-page">
      {/* Title Image */}
      <div className="title-container">
        <img
          src={chrome.runtime.getURL("public/landing-page/Hive.png")} // Path to title image
          alt="Welcome Title"
          className="title-image"
        />
        <p className="title-subtext">Explore the web through scavenger hunts</p>
      </div>

      {/* Buttons at the Bottom */}
      <button
        className="button-library"
        onClick={() => setCurrentPage("library")}
      >
        My Library
      </button>
      <button className="button-hunt" onClick={handleStartHunt}>
        Start a Hunt
      </button>


      {/* Background Figures */}
      <div
        className="background-figure figure-top-right"
        style={{
          backgroundImage: `url(${chrome.runtime.getURL(
            "public/landing-page/upper-right.png"
          )})`,
        }}
      ></div>
      <div
        className="background-figure figure-listen-left"
        style={{
          backgroundImage: `url(${chrome.runtime.getURL(
            "public/landing-page/listen-side.png"
          )})`,
        }}
      ></div>
      <div
        className="background-figure figure-above-button"
        style={{
          backgroundImage: `url(${chrome.runtime.getURL(
            "public/landing-page/above-button.png"
          )})`,
        }}
      ></div>
    </div>
  );
};

export default LandingPage;
