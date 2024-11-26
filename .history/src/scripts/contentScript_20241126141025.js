// contentScript.js

console.log("content script running");

if (!document.getElementById('floating-sidebar-root')) {
  const rootElement = document.createElement('div');
  rootElement.id = 'floating-sidebar-root';
  document.body.appendChild(rootElement);
}

// Extract text content from <p> tags
function extractPageContent() {
  const paragraphs = document.querySelectorAll('article p');
  let content = '';
  paragraphs.forEach((p) => {
    content += p.innerText + '\n';
  });
  console.log("Extracted page content:", content);
  return content;
}

// Listen for messages from the sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  if (message.action === "extract_content") {
    const content = extractPageContent();
    sendResponse({ content });
  } else if (message.action === "start_highlight_mode") {
    const { index } = message;
    startHighlightMode(index);
    sendResponse({ status: "Highlight mode started" });
  }
});




/*
Logic for Highlight Pen is Below
*/
let highlightModeActive = false;
let currentIndex = null; // Track the active index globally

function startHighlightMode(index) {
  highlightModeActive = true;
  currentIndex = index; // Update the active index
  document.addEventListener('mouseup', handleHighlight);
  console.log("Highlight mode activated.");
}

function stopHighlightMode() {
  highlightModeActive = false;
  currentIndex = null; // Clear the active index
  document.removeEventListener('mouseup', handleHighlight);
  console.log("Highlight mode deactivated.");
}

function handleHighlight() {
  if (!highlightModeActive) return;

  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    const commonAncestor = range.commonAncestorContainer;

    // Create a wrapper span for the entire selection
    const highlightSpan = document.createElement('span');
    highlightSpan.style.background = 'lightblue';
    highlightSpan.style.borderRadius = '3px';

    // Extract the selected content
    const fragment = range.cloneContents();
    highlightSpan.appendChild(fragment);

    // Replace the range with the highlight span
    range.deleteContents();
    range.insertNode(highlightSpan);

    // Ensure DOM integrity: highlight across paragraphs
    if (startContainer !== endContainer) {
      // Normalize all nodes inside the highlight
      highlightSpan.normalize();
    }

    // Send the selected text back to the extension
    chrome.runtime.sendMessage({
      action: "text_highlighted",
      text: highlightSpan.textContent,
      index: currentIndex
    });

    // Deactivate highlight mode
    stopHighlightMode();
  }
}
