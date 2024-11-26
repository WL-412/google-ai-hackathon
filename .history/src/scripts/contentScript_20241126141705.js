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

function handleHighlight(index) {
  if (!highlightModeActive) return;

  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);

    // If the selection spans multiple elements, split the range handling
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // Check if the selection spans multiple nodes
    if (startContainer !== endContainer) {
      // Handle multi-paragraph selection
      const commonAncestor = range.commonAncestorContainer;

      // Clone the range and isolate the selection
      const clonedRange = range.cloneRange();
      clonedRange.setStart(startContainer, range.startOffset);
      clonedRange.setEnd(endContainer, range.endOffset);

      // Wrap the highlighted range in a span for each paragraph
      const nodes = Array.from(commonAncestor.childNodes);
      nodes.forEach((node) => {
        if (clonedRange.intersectsNode(node)) {
          const paragraphRange = clonedRange.cloneRange();
          paragraphRange.selectNodeContents(node);

          const highlightSpan = document.createElement('span');
          highlightSpan.style.background = 'lightblue';
          highlightSpan.style.borderRadius = '3px';
          highlightSpan.textContent = paragraphRange.toString();

          paragraphRange.deleteContents();
          paragraphRange.insertNode(highlightSpan);
        }
      });
    } else {
      // Handle single-paragraph selection
      const highlightSpan = document.createElement('span');
      highlightSpan.style.background = 'lightblue';
      highlightSpan.style.borderRadius = '3px';
      highlightSpan.textContent = selectedText;
      range.deleteContents();
      range.insertNode(highlightSpan);
    }

    // Send the selected text back to the extension
    chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText, index: currentIndex });
    stopHighlightMode();
  }
}
