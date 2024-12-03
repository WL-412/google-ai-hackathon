import React from "react";
import Lottie from "react-lottie-player";

const LoadingPage: React.FC = () => {
  const animationPath = chrome.runtime.getURL('./public/anime/小五.json');

  return (
    <div style={styles.container}>
      <Lottie
        loop
        path={animationPath}
        play
        style={styles.animation}
      />
      <p style={styles.text}>Preparing your scavenger hunt...</p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Full-screen height
    backgroundColor: "#EBF495", // Optional background color
  },
  animation: {
    width: "50%",
    height: "50%",
  },
  text: {
    color: "#6e7926", // Change to your desired color
    fontSize: "18px", // Adjust font size as needed
    textAlign: "center",
    marginTop: "20px", // Space between animation and text
  },
};

export default LoadingPage;
