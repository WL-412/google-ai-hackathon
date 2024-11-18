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
  Respond with a score between 0 and 20 based on the correctness of the answer. 
  Return in this format: "Score is: "`;
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

  if (message.action === 'summarize_page') {
    console.log("Message received");
    const content = message.content;
    runPrompt(`Generate 5 questions and answers based on the key points of the article. 
      Structure the response like this "question: {questions} answer: {answer}" no other text`, params, content)
      .then(summary => {
        console.log("Summary sent", summary);
        // Parse question/answer pairs
        const questionAnswerPairs = summary.split("\n\n").map(block => {
          const [questionLine, answerLine] = block.split("\n").map(line => line.trim());
          const question = questionLine.replace(/^question:\s*/i, "").trim();
          const answer = answerLine.replace(/^answer:\s*/i, "").trim();
          return { question, answer };
        });

        // Store in chrome.storage
        chrome.storage.local.set({ questionAnswerPairs }, () => {
          console.log("Questions and answers stored:", questionAnswerPairs);
        });
      })
      .catch(error => console.error('Error summarizing content:', error));
  } else if (message.action === 'validate_answer') {
    const { question, userAnswer, index } = message;
    validateAnswer(question, userAnswer)
      .then(response => {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'display_feedback', feedback: response, index });
        console.log("Feedback sent", response);
      })
      .catch(error => console.error('Error validating answer:', error));
  }
});
