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

  // Create a DocumentFragment to handle multi-paragraph selections
  const fragment = range.cloneContents();
  const wrapper = document.createElement('div');
  wrapper.appendChild(fragment);

  // Iterate through the contents to preserve structure
  let highlightedHTML = '';
  wrapper.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Wrap text nodes in a span
      const span = document.createElement('span');
      span.style.background = 'lightblue';
      span.style.borderRadius = '3px';
      span.textContent = node.textContent;
      highlightedHTML += span.outerHTML;
    } else {
      // Wrap element nodes by preserving their structure
      const clonedNode = node.cloneNode(true);
      highlightNodeContent(clonedNode);
      highlightedHTML += clonedNode.outerHTML;
    }
  });

  // Replace the selected range with the highlighted HTML
  const container = document.createElement('div');
  container.innerHTML = highlightedHTML;

  range.deleteContents();
  while (container.firstChild) {
    range.insertNode(container.firstChild);
  }

  // Send the highlighted content to the extension
  chrome.runtime.sendMessage({
    action: "text_highlighted",
    text: selection.toString(),
    index: currentIndex
  });

  stopHighlightMode();
}

// Recursive function to highlight content inside an element
function highlightNodeContent(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const span = document.createElement('span');
    span.style.background = 'lightblue';
    span.style.borderRadius = '3px';
    span.textContent = node.textContent;
    node.replaceWith(span);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach((child) => highlightNodeContent(child));
  }
}
