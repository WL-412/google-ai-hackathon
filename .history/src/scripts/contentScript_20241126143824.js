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

    // Process only the selected portion without affecting the surrounding structure
    wrapSelectedTextWithHighlight(range);

    // Send the highlighted text and index back to the extension
    chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText, index: currentIndex });

    stopHighlightMode();
  }
}

// Helper function to wrap the selected text within the range
function wrapSelectedTextWithHighlight(range) {
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
    // Single text node: simply wrap the selected portion
    wrapTextNode(range, startContainer);
  } else {
    // Multiple nodes selected: process start, middle, and end parts
    wrapStartNode(range);
    wrapMiddleNodes(range);
    wrapEndNode(range);
  }
}

// Wrap the selected portion within a single text node
function wrapTextNode(range, textNode) {
  const selectedText = range.toString();
  const highlightSpan = document.createElement('span');
  highlightSpan.style.background = 'lightblue';
  highlightSpan.style.borderRadius = '3px';
  highlightSpan.textContent = selectedText;

  const textContent = textNode.textContent;
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;

  // Split the text node into three parts: before, highlighted, and after
  const beforeText = textContent.slice(0, startOffset);
  const afterText = textContent.slice(endOffset);

  const parent = textNode.parentNode;
  if (beforeText) parent.insertBefore(document.createTextNode(beforeText), textNode);
  parent.insertBefore(highlightSpan, textNode);
  if (afterText) parent.insertBefore(document.createTextNode(afterText), textNode);

  parent.removeChild(textNode);
}

// Wrap the starting node in the range
function wrapStartNode(range) {
  const startContainer = range.startContainer;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = startContainer;
    const startOffset = range.startOffset;

    const highlightSpan = document.createElement('span');
    highlightSpan.style.background = 'lightblue';
    highlightSpan.style.borderRadius = '3px';
    highlightSpan.textContent = textNode.textContent.slice(startOffset);

    const beforeText = textNode.textContent.slice(0, startOffset);

    const parent = textNode.parentNode;
    if (beforeText) parent.insertBefore(document.createTextNode(beforeText), textNode);
    parent.insertBefore(highlightSpan, textNode);

    parent.removeChild(textNode);
  }
}

// Wrap the ending node in the range
function wrapEndNode(range) {
  const endContainer = range.endContainer;
  if (endContainer.nodeType === Node.TEXT_NODE) {
    const textNode = endContainer;
    const endOffset = range.endOffset;

    const highlightSpan = document.createElement('span');
    highlightSpan.style.background = 'lightblue';
    highlightSpan.style.borderRadius = '3px';
    highlightSpan.textContent = textNode.textContent.slice(0, endOffset);

    const afterText = textNode.textContent.slice(endOffset);

    const parent = textNode.parentNode;
    parent.insertBefore(highlightSpan, textNode);
    if (afterText) parent.insertBefore(document.createTextNode(afterText), textNode);

    parent.removeChild(textNode);
  }
}

// Wrap all middle nodes within the range
function wrapMiddleNodes(range) {
  const commonAncestor = range.commonAncestorContainer;

  const walker = document.createTreeWalker(
    commonAncestor,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return range.intersectsNode(node) &&
          node !== range.startContainer &&
          node !== range.endContainer
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    const highlightSpan = document.createElement('span');
    highlightSpan.style.background = 'lightblue';
    highlightSpan.style.borderRadius = '3px';
    highlightSpan.textContent = currentNode.textContent;

    const parent = currentNode.parentNode;
    parent.replaceChild(highlightSpan, currentNode);
  }
}
