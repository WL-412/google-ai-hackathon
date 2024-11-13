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
  const prompt = `Under the context of the above article, evaluate the answer to this question: "${question}" with the user answer: "${userAnswer}". Respond with 'Correct' if the answer is true, otherwise don't include "correct" and provide a hint starting with 'Hint: '.`;
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
    runPrompt(`Generate 5 questions based on the key points of the following content: ${content}. Give me questions only, no other text.`, params, content)
      .then(summary => {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'display_summary', summary });
        console.log("Summary sent", summary);
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
