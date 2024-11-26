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
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // Check if the selection spans multiple elements
    if (startContainer !== endContainer) {
      // Handle multi-element highlighting
      const fragments = [];
      let currentNode = startContainer;

      while (currentNode && currentNode !== endContainer) {
        if (currentNode.nodeType === Node.TEXT_NODE && selection.containsNode(currentNode, true)) {
          const partialRange = document.createRange();
          partialRange.selectNodeContents(currentNode);

          // Adjust start and end for the first and last nodes
          if (currentNode === startContainer) {
            partialRange.setStart(startContainer, range.startOffset);
          }
          if (currentNode === endContainer) {
            partialRange.setEnd(endContainer, range.endOffset);
          }

          const highlightSpan = document.createElement('span');
          highlightSpan.style.background = 'lightblue';
          highlightSpan.style.borderRadius = '3px';
          highlightSpan.textContent = partialRange.toString();

          // Wrap the content in the highlight span
          partialRange.deleteContents();
          partialRange.insertNode(highlightSpan);

          fragments.push(highlightSpan);
        }

        currentNode = currentNode.nextSibling;
      }

      // Handle the last node
      if (endContainer.nodeType === Node.TEXT_NODE && selection.containsNode(endContainer, true)) {
        const partialRange = document.createRange();
        partialRange.selectNodeContents(endContainer);
        partialRange.setEnd(endContainer, range.endOffset);

        const highlightSpan = document.createElement('span');
        highlightSpan.style.background = 'lightblue';
        highlightSpan.style.borderRadius = '3px';
        highlightSpan.textContent = partialRange.toString();

        partialRange.deleteContents();
        partialRange.insertNode(highlightSpan);

        fragments.push(highlightSpan);
      }

      console.log("Highlighted across elements:", fragments.map((node) => node.textContent).join(" "));
    } else {
      // Single-element highlighting
      const selectedText = range.toString().trim();
      if (selectedText) {
        const highlightSpan = document.createElement('span');
        highlightSpan.style.background = 'lightblue';
        highlightSpan.style.borderRadius = '3px';
        highlightSpan.textContent = selectedText;

        range.deleteContents();
        range.insertNode(highlightSpan);

        console.log("Highlighted text:", selectedText);
      }
    }

    // Clear the selection after highlighting
    selection.removeAllRanges();

    // Send the highlighted text back to the extension
    chrome.runtime.sendMessage({
      action: "text_highlighted",
      text: selection.toString(),
      index: currentIndex
    });

    stopHighlightMode();
  }
}
