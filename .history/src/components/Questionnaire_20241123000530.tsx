import React, { useState, useEffect } from "react";
import "../styles/Questionnaire.css";

interface QuestionAnswerPair {
  question: string;
  answer: string;
}

interface QuestionnaireProps {
  questionAnswerPairs: QuestionAnswerPair[];
}

const Questionnaire: React.FC<QuestionnaireProps> = ({
  questionAnswerPairs,
}) => {
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
    const handleMessage = (message: any) => {
      if (message.action === "text_highlighted") {
        console.log("Received highlighted text:", message.text);

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
  }, []); // No dependencies



  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleHighlightPen = (index: number) => {
    chrome.runtime.sendMessage({ action: "start_highlight_mode", index: index }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
      } else if (response) {
        console.log("Response from content script:", response.status);
      } else {
        console.warn("No response received from content script.");
      }
    });
  };

  const validateAnswer = (index: number) => {
    const question = questionAnswerPairs[index].question;
    const userAnswer = answers[index];

    chrome.runtime.sendMessage({
      action: "validate_answer",
      question,
      userAnswer,
      index,
    });

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
      {questionAnswerPairs.map((pair, index) => (
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
                className="extension-button" onClick={() => handleHighlightPen(index)}>Highlight Pen</button>
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
