import React, { useState, useEffect } from "react";
import "../styles/Questionnaire.css";

interface QuestionnaireProps {
  onBack: () => void;
  questionAnswerPairs: { question: string; answer: string }[];
}

const Questionnaire: React.FC<QuestionnaireProps> = ({
  onBack,
  questionAnswerPairs,
}) => {
  const [answers, setAnswers] = useState<string[]>(
    Array(questionAnswerPairs.length).fill("")
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<string[]>(
    Array(questionAnswerPairs.length).fill("")
  );
  const [submitted, setSubmitted] = useState<boolean[]>(
    Array(questionAnswerPairs.length).fill(false)
  );

  useEffect(() => {
    setAnswers(Array(questionAnswerPairs.length).fill(""));
    setFeedback(Array(questionAnswerPairs.length).fill(""));
    setSubmitted(Array(questionAnswerPairs.length).fill(false));
  }, [questionAnswerPairs]);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === "text_highlighted") {
        setAnswers((prevAnswers) => {
          const newAnswers = [...prevAnswers];
          newAnswers[message.index] = message.text;
          return newAnswers;
        });
      }

      if (message.action === "display_feedback") {
        const { feedback: feedbackMessage, index } = message;
        setFeedback((prevFeedback) => {
          const newFeedback = [...prevFeedback];
          newFeedback[index] = feedbackMessage;
          return newFeedback;
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleHighlightPen = (index: number, answerMode: boolean) => {
    chrome.runtime.sendMessage(
      { action: "start_highlight_mode", index, answerMode: answerMode },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message:",
            chrome.runtime.lastError.message
          );
        } else if (response) {
          console.log("Response from content script:", response.status);
        } else {
          console.warn("No response received from content script.");
        }
      }
    );
  };

  const validateAnswer = (index: number) => {
    const question = questionAnswerPairs[index].question;
    const userAnswer = answers[index];

    chrome.runtime.sendMessage(
      {
        action: "validate_answer",
        question,
        userAnswer,
        index,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error validating answer:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("Validation response:", response);
        }

        chrome.runtime.sendMessage(
          { action: "learn_more", question, userAnswer, index },
          (learnMoreResponse) => {
            if (learnMoreResponse.success) {
              console.log(
                `Explore response for question ${index}:`,
                learnMoreResponse.exploreResponse
              );
            } else {
              console.error("Error in LearnMore:", learnMoreResponse.error);
            }
          }
        );
      }
    );

    setSubmitted((prevSubmitted) => {
      const newSubmitted = [...prevSubmitted];
      newSubmitted[index] = true;
      return newSubmitted;
    });
  };

  return (
    <div>
      <button onClick={onBack} className="back-button">
        Back
      </button>
      <h3>LET'S DO THIS</h3>
      {questionAnswerPairs.length > 0 && (
        <div>
          <div className="question-navigation">
            {questionAnswerPairs.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`question-nav-button ${
                  currentQuestionIndex === index ? "active" : ""
                }`}
              >
                Q{index + 1}
              </button>
            ))}
          </div>
          <div className="extension-question-container">
            <p>
              <strong>Question {currentQuestionIndex + 1}:</strong>{" "}
              {questionAnswerPairs[currentQuestionIndex].question}
            </p>
            <input
              type="text"
              value={answers[currentQuestionIndex]}
              onChange={(e) =>
                handleChange(currentQuestionIndex, e.target.value)
              }
              placeholder="Type your answer here"
              className="extension-input-box"
            />
            <button
              className="extension-button"
              onClick={() => handleHighlightPen(currentQuestionIndex, true)}
            >
              Highlight the Answer
            </button>
            <button
              className="extension-button"
              onClick={() => handleHighlightPen(currentQuestionIndex, false)}
            >
              Marker
            </button>
            <button
              onClick={() => validateAnswer(currentQuestionIndex)}
              className="extension-button"
              disabled={!answers[currentQuestionIndex]?.trim()}
            >
              Submit
            </button>
            {feedback[currentQuestionIndex]?.trim() && (
              <p className="extension-feedback">
                {feedback[currentQuestionIndex]}
              </p>
            )}
            {submitted[currentQuestionIndex] && (
              <p className="extension-correct-answer">
                <strong>Correct Answer:</strong>{" "}
                {questionAnswerPairs[currentQuestionIndex].answer}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
