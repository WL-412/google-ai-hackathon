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
    const selectedText = selection.toString();

    // Clone the selected content while preserving structure
    const originalContents = range.cloneContents();

    // Create a DocumentFragment to hold the processed content
    const fragment = document.createDocumentFragment();

    originalContents.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // For plain text nodes, wrap them in a highlight span
        const highlightSpan = document.createElement('span');
        highlightSpan.style.background = 'lightblue';
        highlightSpan.style.borderRadius = '3px';
        highlightSpan.style.padding = '0 4px';
        highlightSpan.style.marginRight = '4px';
        highlightSpan.textContent = node.textContent;

        // Create a question number label
        const questionLabel = document.createElement('span');
        questionLabel.textContent = ` [Q${currentIndex + 1}]`;
        questionLabel.style.color = '#ffffff';
        questionLabel.style.backgroundColor = '#0078D7';
        questionLabel.style.borderRadius = '3px';
        questionLabel.style.padding = '0 6px';
        questionLabel.style.marginLeft = '6px';
        questionLabel.style.fontSize = '0.85em';
        questionLabel.style.fontWeight = 'bold';

        // Append both the highlighted span and the question label
        fragment.appendChild(highlightSpan);
        fragment.appendChild(questionLabel);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // For element nodes, preserve their structure and process their children
        const clonedElement = node.cloneNode(true);
        highlightElementContents(clonedElement);
        fragment.appendChild(clonedElement);
      }
    });

    // Replace the original range contents with the fragment
    range.deleteContents();
    range.insertNode(fragment);

    // Send the highlighted text and index back to the extension
    chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText, index: currentIndex });

    stopHighlightMode();
  }
}
