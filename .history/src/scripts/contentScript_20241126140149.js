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
  if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

  const range = selection.getRangeAt(0);

  // Get the start and end containers of the selection
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  if (startContainer === endContainer) {
    // Single-node selection, highlight directly
    highlightTextInNode(range);
  } else {
    // Multi-node selection
    highlightMultiNodeSelection(range, startContainer, endContainer);
  }

  // Clear the selection
  selection.removeAllRanges();

  // Send the highlighted content to the extension
  chrome.runtime.sendMessage({
    action: "text_highlighted",
    text: selection.toString(),
    index: currentIndex,
  });

  stopHighlightMode();
}

function highlightTextInNode(range) {
  const selectedText = range.toString();
  if (!selectedText.trim()) return;

  const highlightSpan = document.createElement('span');
  highlightSpan.style.background = 'lightblue';
  highlightSpan.style.borderRadius = '3px';
  highlightSpan.textContent = selectedText;

  range.deleteContents();
  range.insertNode(highlightSpan);
}

function highlightMultiNodeSelection(range, startContainer, endContainer) {
  // Handle the start container
  const startRange = document.createRange();
  startRange.setStart(range.startContainer, range.startOffset);
  startRange.setEndAfter(getNodeLastText(range.startContainer));
  highlightTextInNode(startRange);

  // Highlight intermediate nodes
  let currentNode = getNextTextNode(startContainer);
  while (currentNode && currentNode !== endContainer) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(currentNode);
      highlightTextInNode(nodeRange);
    }
    currentNode = getNextTextNode(currentNode);
  }

  // Handle the end container
  const endRange = document.createRange();
  endRange.setStartBefore(getNodeFirstText(endContainer));
  endRange.setEnd(range.endContainer, range.endOffset);
  highlightTextInNode(endRange);
}

// Helper to find the next text node
function getNextTextNode(node) {
  while (node && (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim())) {
    if (node.nextSibling) {
      node = node.nextSibling;
    } else {
      node = node.parentNode.nextSibling;
    }
  }
  return node;
}

// Helper to get the last text node in a container
function getNodeLastText(node) {
  if (node.nodeType === Node.TEXT_NODE) return node;
  return node.lastChild ? getNodeLastText(node.lastChild) : node;
}

// Helper to get the first text node in a container
function getNodeFirstText(node) {
  if (node.nodeType === Node.TEXT_NODE) return node;
  return node.firstChild ? getNodeFirstText(node.firstChild) : node;
}
