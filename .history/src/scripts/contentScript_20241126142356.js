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
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    // Clone the range to prevent modifying the original
    const clonedRange = range.cloneContents();

    // Extract all text nodes from the selection
    const walker = document.createTreeWalker(clonedRange, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    // Iterate through each text node and apply the highlight
    textNodes.forEach((node) => {
      const parentElement = node.parentElement;

      // Create a span with custom styling
      const highlightSpan = document.createElement('span');
      highlightSpan.style.background = 'lightblue';
      highlightSpan.style.borderRadius = '3px';
      highlightSpan.textContent = node.textContent;

      // Replace the text node with the highlighted span
      const textNodeClone = node.cloneNode(true);
      parentElement.replaceChild(highlightSpan, node);

    });

    // Send the selected text back to the extension
    const selectedText = selection.toString();
    chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText, index: currentIndex });
  }

  stopHighlightMode();
}
