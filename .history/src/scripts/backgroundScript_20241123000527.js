// src/background.js

let session = null;

async function initializeSession(params, articleContent) {
  session = await ai.languageModel.create({
    ...params,
    systemPrompt: `You are helping a user understand and answer questions about this article: "${articleContent}".`
  });
}

async function runPrompt(prompt, params, articleContent = '') {
  try {
    // If session doesn't exist, initialize it with article context 
    if (!session) {
      await initializeSession(params, articleContent);
    }
    console.log("Running prompt", prompt);
    return session.prompt(prompt);
  } catch (e) {
    console.error('Prompt failed:', e);
    reset();
    throw e;
  }
}

async function validateAnswer(question, userAnswer) {
  const prompt = `Under the context of the above article, score the answer to this question: "${question}" 
  with the user answer: "${userAnswer}". 
  Respond with a score between 0 and 10 based on the correctness of the answer. 
  Return in this format: "Your Score: {score}/10".
  After that, give me a paragraph that explores the key concepts in the question in more detail. `;
  return runPrompt(prompt, { temperature: 0.7, topK: 5 });
}

async function reset() {
  if (session) {
    session.destroy();
  }
  session = null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const params = {
    temperature: 0.7, // temp value
    topK: 5 // temp value
  };

  if (message.action === "get_active_tab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        sendResponse({ tabId: tabs[0].id });
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });
    return true;
  } else if (message.action === "extract_content") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "extract_content" },
          (response) => {
            sendResponse(response);
          }
        );
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });
    return true;
  } else if (message.action === "summarize_page") {
    const content = message.content;

    // Reset the session to ensure it starts fresh for new content
    reset().then(() => {
      runPrompt(
        `Generate 5 questions and answers based on the key points of the article. 
        Structure the response like this "question: {questions} answer: {answer}" no other text or formatting.`,
        params,
        content
      )
        .then((summary) => {
          const questionAnswerPairs = summary
            .split("\n\n")
            .map((block) => {
              const lines = block.split("\n").map((line) => line.trim());
              const questionLine = lines.find((line) =>
                line.startsWith("question:")
              );
              const answerLine = lines.find((line) =>
                line.startsWith("answer:")
              );

              if (questionLine && answerLine) {
                const question = questionLine.replace(/^question:\s*/i, "").trim();
                const answer = answerLine.replace(/^answer:\s*/i, "").trim();
                return { question, answer, userAnswer: null };
              }
              return null;
            })
            .filter((pair) => pair !== null);

          // Store the questions in the history
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
              const siteUrl = new URL(tabs[0].url).origin;
              chrome.storage.local.get("history", (result) => {
                const history = result.history || {};

                if (!history[siteUrl]) {
                  history[siteUrl] = [];
                }

                // Add questions without user answers
                questionAnswerPairs.forEach((pair) => {
                  history[siteUrl].push(pair);
                });

                // Save the updated history
                chrome.storage.local.set({ history }, () => {
                  console.log(`History updated for ${siteUrl}:`, history[siteUrl]);
                });
              });
            }
          });

          // Send the question-answer pairs back to the frontend
          chrome.storage.local.set({ questionAnswerPairs }, () => {
            console.log("Question answer pairs stored", questionAnswerPairs);
            sendResponse({ success: true, questionAnswerPairs });
          });
        })
        .catch((error) => {
          console.error("Error summarizing content:", error);
          sendResponse({ success: false, error });
        });
    });
    return true;
  } else if (message.action === "validate_answer") {
    const { question, userAnswer, index } = message;

    validateAnswer(question, userAnswer)
      .then((response) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            const siteUrl = new URL(tabs[0].url).origin;
            chrome.storage.local.get("history", (result) => {
              const history = result.history || {};

              if (history[siteUrl]) {
                // Update the specific question's userAnswer
                const entry = history[siteUrl].find(
                  (item) => item.question === question
                );
                if (entry) {
                  entry.userAnswer = userAnswer;
                }
              }

              // Save the updated history
              chrome.storage.local.set({ history }, () => {
                console.log(`History updated with user answer for ${siteUrl}:`, history[siteUrl]);
              });
            });
          }

          // Send feedback to the active tab
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "display_feedback",
              feedback: response,
              index,
            });
          }
        });

        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error validating answer:", error);
        sendResponse({ success: false, error });
      });
    return true;
  } else if (message.action === "get_history") {
    const { siteUrl } = message;
    chrome.storage.local.get("history", (result) => {
      const history = result.history || {};
      if (siteUrl) {
        sendResponse({ success: true, history: history[siteUrl] || [] });
      } else {
        sendResponse({ success: true, history });
      }
    });
    return true;
  } else if (message.action === "start_highlight_mode") {
    // Find the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Send message to content script in the active tab
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  } else if (message.action === "text_highlighted") {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "text_highlighted",
          text: message.text,
        });
      }
    });
    return true;
  }
});
