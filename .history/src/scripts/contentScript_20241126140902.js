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
    const commonAncestor = range.commonAncestorContainer;

    // Process multi-paragraph selection
    if (selection.rangeCount > 0 && commonAncestor.nodeType === Node.ELEMENT_NODE) {
      const fragment = range.cloneContents();
      const span = document.createElement('span');
      span.style.background = 'lightblue';
      span.style.borderRadius = '3px';

      // Add highlight style to selected text within the fragment
      fragment.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textNode = document.createTextNode(node.nodeValue);
          const highlightSpan = document.createElement('span');
          highlightSpan.style.background = 'lightblue';
          highlightSpan.style.borderRadius = '3px';
          highlightSpan.textContent = textNode.nodeValue;
          span.appendChild(highlightSpan);
        } else {
          span.appendChild(node.cloneNode(true));
        }
      });

      // Replace range content with the highlighted fragment
      range.deleteContents();
      range.insertNode(span);
    }

    // Send the selected text back to the extension
    const selectedText = selection.toString();
    chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText, index: currentIndex });
    stopHighlightMode();
  }
}
