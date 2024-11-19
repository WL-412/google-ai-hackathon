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
    chrome.runtime.onMessage.addListener((message) => {
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
    });
  }, []);

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
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
              <button className="extension-button">Highlight Pen</button>
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
