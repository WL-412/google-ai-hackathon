// src/background.js

let session = null;

async function runPrompt(prompt, params) {
  try {
    if (!session) {
      session = await chrome.aiOriginTrial.languageModel.create(params);
    }
    console.log("Running prompt", prompt);
    return session.prompt(prompt);
  } catch (e) {
    console.error('Prompt failed:', e);
    reset();
    throw e;
  }
}

async function reset() {
  if (session) {
    session.destroy();
  }
  session = null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'summarize_page') {
    console.log("Message received");
    const content = message.content;
    const params = {
      temperature: 0.7, // temp value
      topK: 5 // temp value
    };
    runPrompt(`Generate 5 questions based on the key points of the following content: ${content}`, params)
      .then(summary => {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'display_summary', summary });
        console.log("Summary sent", summary);
      })
      .catch(error => console.error('Error summarizing content:', error));
  }
});
