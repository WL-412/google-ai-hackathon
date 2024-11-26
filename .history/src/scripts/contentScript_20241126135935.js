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

  // Split and highlight the selected range
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  if (startContainer === endContainer) {
    // Highlight within the same container
    highlightSingleNode(range);
  } else {
    // Highlight across multiple containers
    highlightMultiNode(range, startContainer, endContainer);
  }

  // Send the highlighted content to the extension
  chrome.runtime.sendMessage({
    action: "text_highlighted",
    text: selection.toString(),
    index: currentIndex
  });

  stopHighlightMode();
}

// Highlight a single node
function highlightSingleNode(range) {
  const selectedText = range.toString();

  // Apply custom highlight style
  const highlightSpan = document.createElement('span');
  highlightSpan.style.background = 'lightblue';
  highlightSpan.style.borderRadius = '3px';
  highlightSpan.textContent = selectedText;

  range.deleteContents();
  range.insertNode(highlightSpan);
}

function highlightMultiNode(range, startContainer, endContainer) {
  // Part 1: Highlight the starting container
  const startRange = range.cloneRange();
  startRange.setEndAfter(startContainer);
  const startText = startRange.extractContents();

  const startHighlightSpan = document.createElement('span');
  startHighlightSpan.style.background = 'lightblue';
  startHighlightSpan.style.borderRadius = '3px';
  startHighlightSpan.appendChild(startText);
  startRange.insertNode(startHighlightSpan);

  // Part 2: Highlight the ending container
  const endRange = range.cloneRange();
  endRange.setStartBefore(endContainer);
  const endText = endRange.extractContents();

  const endHighlightSpan = document.createElement('span');
  endHighlightSpan.style.background = 'lightblue';
  endHighlightSpan.style.borderRadius = '3px';
  endHighlightSpan.appendChild(endText);
  endRange.insertNode(endHighlightSpan);

  // Part 3: Highlight all intermediate nodes using commonAncestorContainer
  const commonAncestor = range.commonAncestorContainer;

  const walker = document.createTreeWalker(
    commonAncestor,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // Only process text nodes fully within the range
        const nodeRange = document.createRange();
        nodeRange.selectNodeContents(node);
        return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );

  while (walker.nextNode()) {
    const currentNode = walker.currentNode;
    const span = document.createElement('span');
    span.style.background = 'lightblue';
    span.style.borderRadius = '3px';
    span.textContent = currentNode.textContent;

    currentNode.replaceWith(span);
  }
}
