import React, { useState, useEffect } from "react";

interface QuestionnaireProps {
  questions: string[];
  onSubmit: (answers: string[]) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({
  questions,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>(Array(questions.length).fill(""));

  useEffect(() => {
    // Listen for feedback from background.js
    const handleMessage = (message: any) => {
      if (message.action === "display_feedback") {
        const { feedback: feedbackMessage, index } = message;
        setFeedback((prevFeedback) => {
          const newFeedback = [...prevFeedback];
          newFeedback[index] = feedbackMessage;
          return newFeedback;
        });
        console.log(feedback);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Clean up listener when component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const validateAnswer = (index: number) => {
    const question = questions[index];
    const userAnswer = answers[index];

    // Send the question and answer to background.js for validation
    chrome.runtime.sendMessage({
      action: "validate_answer",
      question,
      userAnswer
    });
  };

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const formatQuestion = (text: string) => {
    const cleanedText = text.replace(/^[^\w]+/, "").trim();
    const lines = cleanedText.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("##")) {
        return <h4 key={index}>{line.substring(2).trim()}</h4>;
      } else if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={index}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      } else {
        return <p key={index}>{line}</p>;
      }
    });
  };

  return (
    <div>
      {questions.map((question, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <div
            onClick={() => toggleQuestion(index)}
            style={{ cursor: "pointer" }}
          >
            {formatQuestion(question)}
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
              <button style={{ marginRight: "10px" }}>Highlight Pen</button>
              <button onClick={() => validateAnswer(index)} style={{ marginRight: "10px" }}>Submit</button>
              {feedback[index] && <p style={{ color: "blue" }}>{feedback[index]}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Questionnaire;