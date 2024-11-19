import React, { useState, useEffect } from "react";

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

    // Send the question and answer to background.js for validation
    chrome.runtime.sendMessage({
      action: "validate_answer",
      question,
      userAnswer,
      index,
    });

    // Mark the question as submitted
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
        <div key={index} style={{ marginBottom: "20px" }}>
          <div
            onClick={() => toggleQuestion(index)}
            style={{ cursor: "pointer" }}
          >
            <p>
              <strong>Question {index + 1}:</strong>
            </p>
            {pair.question}
          </div>
          {activeQuestion === index && (
            <div>
              <input
                type="text"
                value={answers[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="Type your answer here"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "10px",
                  marginBottom: "10px",
                  boxSizing: "border-box",
                }}
              />
              <button style={{ marginRight: "10px", cursor: "pointer" }}>
                Highlight Pen
              </button>
              <button
                onClick={() => validateAnswer(index)}
                style={{ marginRight: "10px", cursor: "pointer" }}
              >
                Submit
              </button>
              {feedback[index]?.trim() && (
                <p style={{ color: "blue", marginTop: "10px" }}>
                  {feedback[index]}
                </p>
              )}
              {submitted[index] && (
                <p style={{ color: "green", marginTop: "10px" }}>
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
