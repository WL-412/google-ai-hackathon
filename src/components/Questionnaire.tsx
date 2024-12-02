import React, { useState, useEffect } from "react";
import "../styles/Questionnaire.css";
import ConfirmationPopup from "./ConfirmationPopup";

interface QuestionnaireProps {
  questionAnswerPairs: { question: string; answer: string }[];
  onFinish: () => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({
  questionAnswerPairs,
  onFinish,
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

  const [showPopup, setShowPopup] = useState(false);

  const handleFinish = () => {
    setShowPopup(true);
  };

  const handleConfirmFinish = () => {
    setShowPopup(false);
    onFinish();
  };

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
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>LET'S DO THIS</h1>
      </div>
      {questionAnswerPairs.length > 0 && (
        <div className="quiz-content">
          <div className="question-navigation">
            {questionAnswerPairs.slice(0, 8).map((_, index) => (
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
            <p className="question-title">
              {questionAnswerPairs[currentQuestionIndex].question}
            </p>
            <textarea
              value={answers[currentQuestionIndex]}
              onChange={(e) =>
                handleChange(currentQuestionIndex, e.target.value)
              }
              placeholder="Enter your answer here"
              className="answer-input"
            />
            <div className="actions">
              <button
                className="action-button"
                onClick={() => handleHighlightPen(currentQuestionIndex, true)}
              >
                Copy Pen
              </button>
              <button
                onClick={() => validateAnswer(currentQuestionIndex)}
                className="submit-button"
                disabled={!answers[currentQuestionIndex]?.trim()}
              >
                Submit
              </button>
            </div>
          </div>

          {submitted[currentQuestionIndex] ? (
            <div className="tips-section">
              <p className="score-display">{feedback[currentQuestionIndex]}</p>
              <p className="correct-answer">
                The correct answer is:{" "}
                {questionAnswerPairs[currentQuestionIndex].answer}
              </p>
            </div>
          ) : (
            <div className="tips-section">
              <p>
                <strong>Tips</strong>
              </p>
              <p>
                Use the <strong>Highlighter</strong> to highlight notes while
                you read.
              </p>
              <p>
                Use the <strong>Copy Pen</strong> to copy text to a specific
                question.
              </p>
            </div>
          )}

          <div className="footer">
            <button
              className="highlight-button"
              onClick={() => handleHighlightPen(currentQuestionIndex, false)}
            >
              Highlighter
            </button>
            <button className="finish-button" onClick={handleFinish}>
              Finish
            </button>
          </div>
        </div>
      )}
      {showPopup && (
        <ConfirmationPopup
          onClose={() => setShowPopup(false)}
          onConfirm={handleConfirmFinish}
        />
      )}
    </div>
  );
};

export default Questionnaire;
