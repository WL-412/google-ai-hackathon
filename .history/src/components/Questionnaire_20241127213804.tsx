import React, { useState, useEffect } from "react";
import "../styles/Questionnaire.css";

interface QuestionnaireProps {
  onBack: () => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onBack }) => {
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState<
    { question: string; answer: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<string[]>(
    Array(questionAnswerPairs.length).fill("")
  );
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>(
    Array(questionAnswerPairs.length).fill("")
  );
  const [submitted, setSubmitted] = useState<boolean[]>(
    Array(questionAnswerPairs.length).fill(false)
  );

  useEffect(() => {
    chrome.storage.local.get("questionAnswerPairs", (result) => {
      if (result.questionAnswerPairs) {
        setQuestionAnswerPairs(result.questionAnswerPairs);
      }
    });
  }, []);

  const handleGenerateQuestions = () => {
    setQuestionAnswerPairs([]);
    setIsLoading(true);

    chrome.runtime.sendMessage({ action: "get_active_tab" }, (response) => {
      if (response && response.tabId) {
        chrome.runtime.sendMessage(
          { action: "extract_content", tabId: response.tabId },
          (contentResponse) => {
            if (contentResponse && contentResponse.content) {
              chrome.runtime.sendMessage(
                { action: "summarize_page", content: contentResponse.content },
                (summarizeResponse) => {
                  setIsLoading(false);
                  if (
                    summarizeResponse &&
                    summarizeResponse.questionAnswerPairs
                  ) {
                    setQuestionAnswerPairs(
                      summarizeResponse.questionAnswerPairs
                    );
                  }
                }
              );
            } else {
              setIsLoading(false);
            }
          }
        );
      } else {
        console.error("Failed to get active tab:", chrome.runtime.lastError);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === "text_highlighted") {
        setAnswers((prevAnswers) => {
          const newAnswers = [...prevAnswers];
          newAnswers[message.index] = message.text;
          console.log("Updated answer state:", newAnswers);
          return newAnswers;
        });
      }

      if (message.action === "display_feedback") {
        console.log("Feedback message received in Questionnaire:", message);
        const { feedback: feedbackMessage, index } = message;
        setFeedback((prevFeedback) => {
          const newFeedback = [...prevFeedback];
          newFeedback[index] = feedbackMessage;
          console.log("Updated feedback state:", newFeedback);
          return newFeedback;
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleHighlightPen = (index: number) => {
    chrome.runtime.sendMessage(
      { action: "start_highlight_mode", index, answerMode: true },
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

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  return (
    <div>
      <button onClick={onBack} className="back-button">
        Back
      </button>
      <h3>LET'S DO THIS</h3>
      <button
        className="extension-generate-button"
        onClick={handleGenerateQuestions}
      >
        Generate Questions
      </button>
      {isLoading && <p className="extension-loading-text">Generating...</p>}
      {!isLoading &&
        questionAnswerPairs.length > 0 &&
        questionAnswerPairs.map((pair, index) => (
          <div key={index} className="extension-question-container">
            <div
              onClick={() => toggleQuestion(index)}
              className="extension-question-header"
            >
              <p>
                <strong>Question {index + 1}:</strong> {pair.question}
              </p>
            </div>
            {activeQuestion === index && (
              <div>
                <input
                  type="text"
                  value={answers[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="Type your answer here"
                  className="extension-input-box"
                />
                <button
                  className="extension-button"
                  onClick={() => handleHighlightPen(index)}
                >
                  Marker
                </button>
                <button
                  onClick={() => validateAnswer(index)}
                  className="extension-button"
                >
                  Submit
                </button>
                {feedback[index]?.trim() && (
                  <p className="extension-feedback">{feedback[index]}</p>
                )}
                {submitted[index] && (
                  <p className="extension-correct-answer">
                    <strong>Correct Answer:</strong> {pair.answer}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default Questionnaire;
