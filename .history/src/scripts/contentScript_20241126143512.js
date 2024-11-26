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
        highlightSpan.textContent = node.textContent;
        fragment.appendChild(highlightSpan);
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

// Helper function to highlight text content within an element node
function highlightElementContents(element) {
  element.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      // Wrap text nodes in a highlight span
      const highlightSpan = document.createElement('span');
      highlightSpan.style.background = 'lightblue';
      highlightSpan.style.borderRadius = '3px';
      highlightSpan.textContent = child.textContent;

      // Replace the text node with the highlighted span
      child.replaceWith(highlightSpan);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // Recursively process child elements
      highlightElementContents(child);
    }
  });
}
